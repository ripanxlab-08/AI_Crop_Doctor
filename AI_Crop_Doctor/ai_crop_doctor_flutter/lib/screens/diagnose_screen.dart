// ════════════════════════════════════════════════════════════════════════════
// Diagnose Screen — Camera + Gallery + Live Preview + Diagnosis Pipeline
// ════════════════════════════════════════════════════════════════════════════

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';

import '../services/crop_api_service.dart';
import '../theme/app_theme.dart';
import 'result_screen.dart';

class DiagnoseScreen extends StatefulWidget {
  const DiagnoseScreen({super.key});

  @override
  State<DiagnoseScreen> createState() => _DiagnoseScreenState();
}

class _DiagnoseScreenState extends State<DiagnoseScreen>
    with WidgetsBindingObserver {
  CameraController? _cameraController;
  List<CameraDescription> _cameras = [];
  int _selectedCamera = 0;

  bool _cameraReady = false;
  bool _cameraError = false;
  String _cameraErrorMsg = '';
  bool _showCamera = false;

  File? _pickedImage;
  String? _pickedImagePath;

  bool _diagnosing = false;
  int _step = 0;

  final _steps = [
    'Checking image quality…',
    'Scanning leaf…',
    'Running AI diagnosis…',
    'Analysing severity stage…',
    'Preparing treatment plan…',
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _cameraController?.dispose();
    super.dispose();
  }

  // ─── Camera init ──────────────────────────────────────────────────────

  Future<void> _initCamera() async {
    setState(() {
      _cameraError = false;
      _cameraReady = false;
    });
    try {
      _cameras = await availableCameras();
      if (_cameras.isEmpty) {
        setState(() {
          _cameraError = true;
          _cameraErrorMsg = 'No camera found on this device.';
        });
        return;
      }
      final cam = _cameras[_selectedCamera];
      final controller = CameraController(
        cam,
        ResolutionPreset.high,
        enableAudio: false,
        imageFormatGroup: ImageFormatGroup.jpeg,
      );
      await controller.initialize();
      if (!mounted) return;
      setState(() {
        _cameraController = controller;
        _cameraReady = true;
      });
    } catch (e) {
      setState(() {
        _cameraError = true;
        _cameraErrorMsg = e.toString();
      });
    }
  }

  Future<void> _openCamera() async {
    setState(() => _showCamera = true);
    await _initCamera();
  }

  void _closeCamera() {
    _cameraController?.dispose();
    _cameraController = null;
    setState(() {
      _showCamera = false;
      _cameraReady = false;
    });
  }

  Future<void> _flipCamera() async {
    if (_cameras.length < 2) return;
    _selectedCamera = (_selectedCamera + 1) % _cameras.length;
    await _initCamera();
  }

  Future<void> _capturePhoto() async {
    if (_cameraController == null || !_cameraReady) return;
    try {
      final xFile = await _cameraController!.takePicture();
      final file = File(xFile.path);
      _closeCamera();
      setState(() {
        _pickedImage = file;
        _pickedImagePath = xFile.path;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Capture failed: $e')),
      );
    }
  }

  // ─── Gallery pick ─────────────────────────────────────────────────────

  Future<void> _pickFromGallery() async {
    final picker = ImagePicker();
    final xFile = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 90,
    );
    if (xFile != null) {
      setState(() {
        _pickedImage = File(xFile.path);
        _pickedImagePath = xFile.path;
      });
    }
  }

  // ─── Run diagnosis ────────────────────────────────────────────────────

  Future<void> _runDiagnosis() async {
    if (_pickedImage == null) return;
    setState(() {
      _diagnosing = true;
      _step = 0;
    });

    // Step ticker
    final tickers = [
      Future.delayed(const Duration(milliseconds: 700), () => setState(() => _step = 1)),
      Future.delayed(const Duration(milliseconds: 1400), () => setState(() => _step = 2)),
      Future.delayed(const Duration(milliseconds: 2100), () => setState(() => _step = 3)),
      Future.delayed(const Duration(milliseconds: 2600), () => setState(() => _step = 4)),
    ];

    final service = context.read<CropApiService>();
    final result = await service.diagnose(_pickedImage!);

    for (final _ in tickers) {} // ensure tickers were registered

    setState(() => _diagnosing = false);

    if (!mounted) return;
    if (result != null) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => ResultScreen(result: result)),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(service.error ?? 'Diagnosis failed. Please try again.'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _reset() {
    setState(() {
      _pickedImage = null;
      _pickedImagePath = null;
      _diagnosing = false;
      _step = 0;
    });
  }

  // ─── Build ────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    // Full-screen camera modal
    if (_showCamera) {
      return _buildCameraView();
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Diagnose Your Crop'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _diagnosing ? _buildScanningView() : _buildPickView(),
    );
  }

  // ── Camera full-screen view ──────────────────────────────────────────

  Widget _buildCameraView() {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Live preview
          if (_cameraReady && _cameraController != null)
            CameraPreview(_cameraController!)
          else if (_cameraError)
            _buildCameraError()
          else
            const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircularProgressIndicator(color: Colors.white),
                  SizedBox(height: 16),
                  Text('Starting camera…',
                      style: TextStyle(color: Colors.white70)),
                ],
              ),
            ),

          // Top bar
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Container(
              color: Colors.black54,
              child: SafeArea(
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Close
                      _camIconBtn(
                        Icons.close,
                        'Close',
                        _closeCamera,
                      ),
                      // Status
                      Text(
                        _cameraReady
                            ? '🟢 Camera live'
                            : _cameraError
                                ? '🔴 Error'
                                : '⏳ Starting…',
                        style: const TextStyle(
                            color: Colors.white, fontWeight: FontWeight.w600),
                      ),
                      // Flip
                      _camIconBtn(
                        Icons.flip_camera_android,
                        'Flip',
                        _cameras.length > 1 ? _flipCamera : null,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // Leaf guide frame
          if (_cameraReady)
            Center(
              child: _LeafGuideFrame(),
            ),

          // Bottom — shutter
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              color: Colors.black54,
              padding: const EdgeInsets.symmetric(vertical: 32),
              child: Column(
                children: [
                  if (_cameraReady)
                    const Text(
                      'Place the leaf inside the frame',
                      style: TextStyle(color: Colors.white70, fontSize: 13),
                    ),
                  const SizedBox(height: 20),
                  // Shutter button
                  GestureDetector(
                    onTap: _cameraReady ? _capturePhoto : null,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 100),
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: Colors.white38,
                          width: 6,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.white.withOpacity(0.3),
                            blurRadius: 20,
                            spreadRadius: 2,
                          )
                        ],
                      ),
                      child: Center(
                        child: Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            color: _cameraReady
                                ? AppTheme.primaryGreen
                                : Colors.grey,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCameraError() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.videocam_off, color: Colors.red, size: 64),
          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Text(
              _cameraErrorMsg,
              style: const TextStyle(color: Colors.white70),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 24),
          TextButton(
            onPressed: _initCamera,
            child: const Text('Try Again',
                style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Widget _camIconBtn(IconData icon, String tooltip, VoidCallback? onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: Colors.white12,
          borderRadius: BorderRadius.circular(22),
        ),
        child: Icon(icon, color: Colors.white, size: 22),
      ),
    );
  }

  // ── Pick / Preview view ──────────────────────────────────────────────

  Widget _buildPickView() {
    if (_pickedImage != null) {
      return _buildPreviewView();
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // Card hero
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: AppTheme.primarySoft,
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: const Icon(Icons.camera_alt_rounded,
                        size: 40, color: AppTheme.primaryGreen),
                  ),
                  const SizedBox(height: 16),
                  Text('Take a clear leaf photo',
                      style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 8),
                  const Text(
                    '• Point camera at a single leaf\n'
                    '• Use good natural light\n'
                    '• Fill the guide frame with the leaf',
                    style: TextStyle(fontSize: 13, height: 1.7),
                    textAlign: TextAlign.left,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Camera button
          FilledButton.icon(
            onPressed: _openCamera,
            icon: const Icon(Icons.camera_alt),
            label: const Text('Open Camera'),
          ),
          const SizedBox(height: 12),

          // Gallery + Upload
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _pickFromGallery,
                  icon: const Icon(Icons.photo_library_rounded),
                  label: const Text('Gallery'),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(0, 52),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _pickFromGallery,
                  icon: const Icon(Icons.upload_file_rounded),
                  label: const Text('Upload'),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(0, 52),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPreviewView() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // Preview image
          Stack(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: AspectRatio(
                  aspectRatio: 1,
                  child: Image.file(_pickedImage!, fit: BoxFit.cover),
                ),
              ),
              Positioned(
                top: 12,
                right: 12,
                child: GestureDetector(
                  onTap: _reset,
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: Colors.black54,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.close, color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Diagnose button
          FilledButton.icon(
            onPressed: _runDiagnosis,
            icon: const Icon(Icons.biotech_rounded),
            label: const Text('Start Diagnosis'),
          ),
          const SizedBox(height: 12),

          // Retake
          OutlinedButton(
            onPressed: _reset,
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(double.infinity, 52),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            child: const Text('Choose another image'),
          ),
        ],
      ),
    );
  }

  // ── Scanning / loading view ──────────────────────────────────────────

  Widget _buildScanningView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Leaf preview with scanner line
            if (_pickedImage != null)
              Stack(
                alignment: Alignment.center,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: SizedBox(
                      width: 220,
                      height: 220,
                      child: Image.file(_pickedImage!, fit: BoxFit.cover),
                    ),
                  ),
                  // Green scanning ring
                  Container(
                    width: 220,
                    height: 220,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: AppTheme.primaryGreen,
                        width: 3,
                      ),
                    ),
                  ),
                ],
              ),

            const SizedBox(height: 32),

            // Current step label
            Text(
              _steps[_step.clamp(0, _steps.length - 1)],
              style: GoogleFonts.outfit(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppTheme.primaryGreen,
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 28),

            // Step indicators
            Column(
              children: List.generate(_steps.length, (i) {
                final done = i < _step;
                final current = i == _step;
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    children: [
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: done
                              ? AppTheme.stageG0
                              : current
                                  ? AppTheme.primaryGreen
                                  : Colors.grey.shade200,
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: done
                              ? const Icon(Icons.check,
                                  color: Colors.white, size: 16)
                              : Text(
                                  '${i + 1}',
                                  style: TextStyle(
                                    color: current
                                        ? Colors.white
                                        : Colors.grey.shade500,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        _steps[i],
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: current || done
                              ? FontWeight.w600
                              : FontWeight.normal,
                          color: current || done
                              ? Theme.of(context).colorScheme.onSurface
                              : Colors.grey,
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Leaf guide frame overlay ─────────────────────────────────────────────

class _LeafGuideFrame extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (ctx, constraints) {
      final size = constraints.maxWidth * 0.72;
      return SizedBox(
        width: size,
        height: size,
        child: Stack(
          children: [
            // Rounded border
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white60, width: 2),
                borderRadius: BorderRadius.circular(24),
              ),
            ),
            // Corner accents
            ...['tl', 'tr', 'bl', 'br'].map((corner) {
              final isLeft = corner.endsWith('l');
              final isTop = corner.startsWith('t');
              return Positioned(
                top: isTop ? 0 : null,
                bottom: isTop ? null : 0,
                left: isLeft ? 0 : null,
                right: isLeft ? null : 0,
                child: Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    border: Border(
                      top: isTop
                          ? const BorderSide(color: Colors.white, width: 4)
                          : BorderSide.none,
                      bottom: isTop
                          ? BorderSide.none
                          : const BorderSide(color: Colors.white, width: 4),
                      left: isLeft
                          ? const BorderSide(color: Colors.white, width: 4)
                          : BorderSide.none,
                      right: isLeft
                          ? BorderSide.none
                          : const BorderSide(color: Colors.white, width: 4),
                    ),
                  ),
                ),
              );
            }),
          ],
        ),
      );
    });
  }
}
