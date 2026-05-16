import Aurora from './Aurora'
import './ContactFooter.css'

type ContactFooterProps = {
  showAurora?: boolean
}

export default function ContactFooter({ showAurora = true }: ContactFooterProps) {
  return (
    <footer className="contact-footer" aria-labelledby="contact-footer-title">
      {showAurora && (
        <div className="contact-footer__aurora" aria-hidden="true">
          <Aurora
            colorStops={['#0e0103', '#041324', '#6b5b7a']}
            amplitude={0.85}
            blend={0.4}
            speed={0.8}
            maxDpr={1.4}
            mobileMaxDpr={0.9}
            desktopFps={48}
            mobileFps={24}
            pauseWhenOffscreen
          />
        </div>
      )}

      <div className="contact-footer__inner">
        <h2 id="contact-footer-title">お問い合わせ</h2>
        <p className="contact-footer__lead">案件のご相談、共同開発のご連絡はページ上部のお問い合わせフォームをご利用ください。</p>
        <a className="contact-footer__cta" href="#contact-title">フォームへ移動</a>
      </div>
    </footer>
  )
}


