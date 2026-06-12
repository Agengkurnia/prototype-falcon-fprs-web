import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Status bar style
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Color(0xFF005D41),
    statusBarIconBrightness: Brightness.light,
  ));

  // Lock to portrait
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  runApp(const FalconSfaApp());
}

class FalconSfaApp extends StatelessWidget {
  const FalconSfaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Falcon SFA Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF005D41),
          primary: const Color(0xFF005D41),
        ),
      ),
      home: const WebViewScreen(),
    );
  }
}

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  InAppWebViewController? _controller;
  bool _isLoading = true;

  // Load from Android native assets folder
  final String _initialUrl =
      'file:///android_asset/web/Views/Mobile/home.html';

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        if (_controller != null) {
          final canGoBack = await _controller!.canGoBack();
          if (canGoBack) {
            await _controller!.goBack();
          } else {
            if (!context.mounted) return;
            final shouldExit = await showDialog<bool>(
              context: context,
              builder: (ctx) => AlertDialog(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                title: const Text('Keluar Aplikasi?'),
                content: const Text(
                    'Anda yakin ingin keluar dari Falcon SFA?'),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(ctx).pop(false),
                    child: const Text('Batal'),
                  ),
                  FilledButton(
                    onPressed: () => Navigator.of(ctx).pop(true),
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFF005D41),
                    ),
                    child: const Text('Keluar'),
                  ),
                ],
              ),
            );
            if (shouldExit == true) {
              SystemNavigator.pop();
            }
          }
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF005D41),
        body: Stack(
          children: [
            SafeArea(
              top: false,
              child: InAppWebView(
                initialUrlRequest: URLRequest(url: WebUri(_initialUrl)),
                initialSettings: InAppWebViewSettings(
                  allowFileAccess: true,
                  allowFileAccessFromFileURLs: true,
                  allowUniversalAccessFromFileURLs: true,
                  javaScriptEnabled: true,
                  domStorageEnabled: true,
                  databaseEnabled: true,
                  supportZoom: false,
                  useWideViewPort: true,
                  loadWithOverviewMode: true,
                  mixedContentMode:
                      MixedContentMode.MIXED_CONTENT_ALWAYS_ALLOW,
                  transparentBackground: true,
                ),
                onWebViewCreated: (controller) {
                  _controller = controller;
                },
                onLoadStart: (controller, url) {
                  if (mounted) setState(() => _isLoading = true);
                },
                onLoadStop: (controller, url) {
                  if (mounted) setState(() => _isLoading = false);
                },
                onLoadError: (controller, url, code, message) {
                  debugPrint('WebView error: $code - $message for $url');
                },
              ),
            ),
            // Loading overlay
            if (_isLoading)
              Container(
                color: const Color(0xFF005D41),
                child: const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.storefront, size: 64, color: Colors.white),
                      SizedBox(height: 16),
                      Text(
                        'Falcon SFA',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      SizedBox(height: 20),
                      SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          color: Colors.white70,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
