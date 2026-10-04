import SwiftUI
import WebKit

@main
struct NextTimeApp: App {
    var body: some Scene {
        WindowGroup {
            LocalAppView()
                .ignoresSafeArea()
        }
    }
}

struct LocalAppView: UIViewRepresentable {
    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.userContentController.add(context.coordinator, name: "copyInvitation")
        let view = WKWebView(frame: .zero, configuration: configuration)
        view.isOpaque = false
        view.backgroundColor = .systemBackground
        view.scrollView.backgroundColor = .systemBackground
        view.scrollView.contentInsetAdjustmentBehavior = .never
        view.navigationDelegate = context.coordinator
        if let folder = Bundle.main.url(forResource: "Web", withExtension: nil) {
            view.loadFileURL(folder.appendingPathComponent("index.html"), allowingReadAccessTo: folder)
        }
        return view
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    static func dismantleUIView(_ uiView: WKWebView, coordinator: Coordinator) {
        uiView.configuration.userContentController.removeScriptMessageHandler(forName: "copyInvitation")
        uiView.navigationDelegate = nil
    }

    final class Coordinator: NSObject, WKScriptMessageHandler, WKNavigationDelegate {
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "copyInvitation", let text = message.body as? String, text.count <= 5000 else { return }
            UIPasteboard.general.string = text
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
        }

        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = navigationAction.request.url else { decisionHandler(.cancel); return }
            if url.isFileURL || url.scheme == "about" {
                decisionHandler(.allow)
            } else {
                decisionHandler(.cancel)
            }
        }
    }
}
