import { useEffect } from 'react';
import logo from '../assets/logo.png';
import { useT } from '../i18n';

interface Props {
  onDone: () => void;
  version: string;
}

export function HomeScreen({ onDone, version }: Props) {
  const t = useT();

  useEffect(() => {
    const id = setTimeout(onDone, 1800);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <div className="screen-home">
      <div className="home-halo" />
      <div className="home-inner">
        <img src={logo} alt="Coach LoL Live" className="home-logo-big" />
        <h1 className="home-brand">
          COACH<span className="accent-gold">LOL</span>LIVE
        </h1>
        <p className="home-sub">{t('home.subtitle')}</p>
        <div className="home-version">v{version}</div>
        <div className="home-loader">
          <div className="home-loader-bar" />
        </div>
      </div>
    </div>
  );
}
