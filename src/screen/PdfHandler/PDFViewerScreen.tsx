import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Download, Share2, Printer, FileText } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Share from 'react-native-share';
import RNPrint from 'react-native-print';
import Pdf from 'react-native-pdf';
import { API_URL } from '@env';
import { Toast } from '../../components/toastModel/ToastModel';
import ToastNotification from '../../components/toastModel/ToastNotification';

interface BillItem {
  name_english: string;
  item_name?: string;
  qty: number;
  price: number;
  amount: number;
}

interface Buyer {
  buyer_name: string;
  phone: string;
  address: string;
}

interface Bill {
  id: number;
  invoice_number: string;
  invoice_date: string;
  subtotal: number;
  total: number;
  buyer: Buyer;
  items: BillItem[];
}

const PDFViewerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { bill } = route.params as { bill: Bill };

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [printing, setPrinting] = useState(false);

  // Request storage permission
  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      if (Platform.Version >= 33) {
        // Android 13+ doesn't need storage permission for scoped storage
        return true;
      }

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to save PDF files',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Generate PDF from backend
  const generatePDF = async () => {
    console.log('error')
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}api/bills/generate-pdf`,
        {
          id: bill.id,
          invoice_number: bill.invoice_number,
          invoice_date: bill.invoice_date,
          subtotal: bill.subtotal,
          total: bill.total,
          buyer: bill.buyer,
          items: bill.items,
        },
        { timeout: 30000 }
      );

      console.log('PDF Response:', response.data);

      if (response.data.success) {
        // Handle different URL formats from backendcons
        console.log(response)
    let fullUrl = response.data.pdf_url;

// If pdf_url is an object with a 'url' field, use it
if (fullUrl && typeof fullUrl === 'object' && 'url' in fullUrl) {
    console.log(fullUrl.url)
  fullUrl = fullUrl.url;
}

// Ensure full URL for frontend usage
if (fullUrl && !fullUrl.startsWith('http')) {
  // Remove trailing slash from API_URL if needed
  const apiUrlClean = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  // Add leading slash if not present
  fullUrl = `${apiUrlClean}${fullUrl.startsWith('/') ? fullUrl : `/${fullUrl}`}`;
}


        setPdfUrl(fullUrl);
        Toast.success('PDF generated successfully!');
      } else {
        console.log('error')
        throw new Error('PDF generation failed');
      }
    } catch (error) {
      console.error('Generate PDF error:', error);
      Toast.error('Failed to generate PDF');
      Alert.alert('Error', 'Failed to generate PDF from server');
    } finally {
      setLoading(false);
    }
  };

  // Download PDF to device using react-native-blob-util
  const downloadPDF = async () => {
    if (!pdfUrl) {
      Alert.alert('Error', 'Please generate PDF first');
      return;
    }

    setDownloading(true);
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Storage permission is required to download');
        setDownloading(false);
        return;
      }

      const { dirs } = ReactNativeBlobUtil.fs;
      const fileName = `Invoice_${bill.invoice_number}.pdf`;
      
      // Determine download path based on platform and Android version
      let downloadDir = dirs.DownloadDir;
      if (Platform.OS === 'ios') {
        downloadDir = dirs.DocumentDir;
      }

      const filePath = `${downloadDir}/${fileName}`;

      // Configure download
      const configOptions = {
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true, // Use Android Download Manager
          notification: true, // Show download notification
          mediaScannable: true, // Make file visible in gallery/downloads
          title: fileName,
          description: 'Downloading invoice PDF',
          mime: 'application/pdf',
          path: filePath,
        },
      };

      Toast.success('Download started...');

      // Start download
      const response = await ReactNativeBlobUtil.config(
        Platform.OS === 'android' ? configOptions : { fileCache: true, path: filePath }
      ).fetch('GET', pdfUrl);

      console.log('Download response:', response.path());

      if (Platform.OS === 'ios') {
        // Open document on iOS
        ReactNativeBlobUtil.ios.openDocument(response.path());
      }

      Toast.success('PDF downloaded successfully!');
      Alert.alert(
        'Download Complete',
        `Invoice saved to ${Platform.OS === 'ios' ? 'Documents' : 'Downloads'} folder\n\nFile: ${fileName}`,
        [
          { text: 'OK' },
          Platform.OS === 'android'
            ? {
                text: 'Open',
                onPress: () => {
                  ReactNativeBlobUtil.android.actionViewIntent(
                    response.path(),
                    'application/pdf'
                  );
                },
              }
            : null,
        ].filter(Boolean)
      );
    } catch (error) {
      console.error('Download error:', error);
      Toast.error('Failed to download PDF');
      Alert.alert('Error', 'Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // Share PDF using react-native-blob-util
  const sharePDF = async () => {
    if (!pdfUrl) {
      Alert.alert('Error', 'Please generate PDF first');
      return;
    }

    setSharing(true);
    try {
      const { dirs } = ReactNativeBlobUtil.fs;
      const fileName = `Invoice_${bill.invoice_number}.pdf`;
      const tempPath = `${dirs.CacheDir}/${fileName}`;

      // Download to temp cache
      const response = await ReactNativeBlobUtil.config({
        fileCache: true,
        path: tempPath,
      }).fetch('GET', pdfUrl);

      console.log('Temp file path:', response.path());

      // Share using react-native-share
      const shareOptions = {
        title: 'Share Invoice',
        message: `Invoice ${bill.invoice_number} - ${bill.buyer.buyer_name}`,
        url: Platform.OS === 'ios' ? response.path() : `file://${response.path()}`,
        type: 'application/pdf',
        subject: `Invoice ${bill.invoice_number}`,
        failOnCancel: false,
      };

      await Share.open(shareOptions);

      // Clean up temp file after sharing (optional)
      setTimeout(() => {
        ReactNativeBlobUtil.fs.unlink(response.path()).catch((err) => {
          console.log('Cleanup error:', err);
        });
      }, 5000);
    } catch (error: any) {
      console.error('Share error:', error);
      if (error.message !== 'User did not share') {
        Toast.error('Failed to share PDF');
      }
    } finally {
      setSharing(false);
    }
  };

  // Print PDF using react-native-blob-util
  const printPDF = async () => {
    if (!pdfUrl) {
      Alert.alert('Error', 'Please generate PDF first');
      return;
    }

    setPrinting(true);
    try {
      const { dirs } = ReactNativeBlobUtil.fs;
      const fileName = `Invoice_${bill.invoice_number}.pdf`;
      const tempPath = `${dirs.CacheDir}/${fileName}`;

      // Download to temp location
      const response = await ReactNativeBlobUtil.config({
        fileCache: true,
        path: tempPath,
      }).fetch('GET', pdfUrl);

      console.log('Print file path:', response.path());

      // Print the PDF
      await RNPrint.print({
        filePath: response.path(),
      });

      Toast.success('Print job sent successfully!');

      // Clean up temp file
      setTimeout(() => {
        ReactNativeBlobUtil.fs.unlink(response.path()).catch((err) => {
          console.log('Cleanup error:', err);
        });
      }, 3000);
    } catch (error) {
      console.error('Print error:', error);
      Toast.error('Failed to print PDF');
      Alert.alert('Error', 'Failed to print PDF. Make sure a printer is available.');
    } finally {
      setPrinting(false);
    }
  };

  // Generate PDF on mount
  useEffect(() => {
    generatePDF();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoice PDF</Text>
        <View style={{ width: 24 }} />
      </View>
        <ToastNotification/>
      {/* PDF Viewer */}
      <View style={styles.pdfContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Generating PDF...</Text>
          </View>
        ) : pdfUrl ? (
          <Pdf
            trustAllCerts={false}
            source={{ uri: pdfUrl, cache: true }}
            style={styles.pdf}
            onLoadComplete={(numberOfPages) => {
              console.log(`PDF loaded: ${numberOfPages} pages`);
            }}
            onPageChanged={(page, numberOfPages) => {
              console.log(`Current page: ${page}/${numberOfPages}`);
            }}
            onError={(error) => {
              console.error('PDF error:', error);
              Toast.error('Failed to load PDF');
            }}
          />
        ) : (
          <View style={styles.errorContainer}>
            <FileText size={64} color="#CBD5E1" />
            <Text style={styles.errorText}>No PDF available</Text>
            <TouchableOpacity onPress={generatePDF} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Download Button */}
          <TouchableOpacity
            onPress={downloadPDF}
            disabled={!pdfUrl || downloading}
            style={[
              styles.actionButton,
              styles.downloadButton,
              (!pdfUrl || downloading) && styles.disabledButton,
            ]}
          >
            {downloading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Download size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Download</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            onPress={sharePDF}
            disabled={!pdfUrl || sharing}
            style={[
              styles.actionButton,
              styles.shareButton,
              (!pdfUrl || sharing) && styles.disabledButton,
            ]}
          >
            {sharing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Share2 size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Share</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Print Button */}
          <TouchableOpacity
            onPress={printPDF}
            disabled={!pdfUrl || printing}
            style={[
              styles.actionButton,
              styles.printButton,
              (!pdfUrl || printing) && styles.disabledButton,
            ]}
          >
            {printing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Printer size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Print</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Bill Info Footer */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.footerLabel}>Invoice Number</Text>
            <Text style={styles.footerValue}>{bill.invoice_number}</Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.footerLabel}>Total Amount</Text>
            <Text style={styles.footerTotal}>₹{bill.total.toLocaleString('en-IN')}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#E2E8F0',
  },
  pdf: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 130,
    justifyContent: 'center',
  },
  downloadButton: {
    backgroundColor: '#4F46E5',
  },
  shareButton: {
    backgroundColor: '#10B981',
  },
  printButton: {
    backgroundColor: '#F59E0B',
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  footerLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  footerTotal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
});

export default PDFViewerScreen;