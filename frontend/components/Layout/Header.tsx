import { useReducer } from 'react';
import { Link, Button, Box } from '@mui/material';
import Image from 'next/image';
import LanguageIcon from '@mui/icons-material/Language';
import MenuIcon from '@mui/icons-material/Menu';
import OverlayNav from './OverlayNav';
import styles from '../../styles/components/Header.module.css';
import Logo from '../../public/logo1.svg';
import HeroPageLogo from '../../public/logo2.svg';

interface HeaderProps {
  homepage: boolean;
}

const Header = (props: HeaderProps) => {
  const handleMobileNavState = (state: boolean, action: string) => {
    switch (action) {
      case 'OPEN':
        return true;
      case 'CLOSE':
        return false;
      default:
        return state;
    }
  };

  // useReducer to manage mobile menu state
  // 'OPEN' to open the menu, 'CLOSE' to close it
  const [ismobileMenuOpen, dispatch] = useReducer(handleMobileNavState, false);
  const { homepage = false } = props;

  const overlayNavProps = {
    homepage,
    ismobileMenuOpen,
    dispatch,
  };

  // Render the header with different styles based on homepage prop
  if (homepage) {
    return (
      <nav className={styles['header-nav-homepage']}>
        <Link href='/'>
          <Image src={Logo} alt='Wakapadi Logo' />
        </Link>
        <Box className={styles['header-link-container']}>
          <Link href='#'>Who is Nearby</Link>
          <Link href='/about'>About</Link>
          <Link href='#'>Contact</Link>
        </Box>
        <Box className={styles['header-authentication-link-homepage']}>
          <Link href='#'>Log in</Link>
          <Button>Get started</Button>
          <LanguageIcon width='30px' height='30px' />
        </Box>
        <Box
          className={`${styles['mobile-header-authentication-link']} ${
            ismobileMenuOpen ? styles['active'] : ''
          }`}
        >
          <LanguageIcon width='30px' height='30px' />
          <MenuIcon
            width='30px'
            height='30px'
            onClick={() => dispatch('OPEN')}
          />
        </Box>
        <OverlayNav {...overlayNavProps} />
      </nav>
    );
  }

  return (
    <nav
      className={
        homepage ? styles['header-nav-homepage'] : styles['header-nav']
      }
    >
      <Image src={homepage ? HeroPageLogo : Logo} alt='Wakapadi Logo' />
      {/* 1st nav */}
      <Box className={styles['header-link-container']}>
        <Link href='#'>Who is Nearby</Link>
        <Link href='#'>About</Link>
        <Link href='#'>Contact</Link>
      </Box>
      {/* 2nd nav */}
      <Box
        className={
          homepage
            ? styles['header-authentication-link-homepage']
            : styles['header-authentication-link']
        }
      >
        <Link href='#'>Log in</Link>
        <Button>Get started</Button>
        <LanguageIcon width='30px' height='30px' />
      </Box>
      <Box
        className={`${styles['mobile-header-authentication-link']} ${
          homepage ? styles[''] : styles['not-homepage']
        }`}
      >
        <LanguageIcon width='30px' height='30px' />
        <MenuIcon width='30px' height='30px' onClick={() => dispatch('OPEN')} />
      </Box>

      <OverlayNav {...overlayNavProps} />
    </nav>
  );
};

export default Header;
