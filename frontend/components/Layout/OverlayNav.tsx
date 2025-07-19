import Image from 'next/image';
import { Link, Button, Box } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import CloseIcon from '@mui/icons-material/Close';
import styles from '../../styles/components/Header.module.css';
import HeroPageLogo from '../../public/logo2.svg';

interface OverlayNavProps {
  homepage: boolean;
  ismobileMenuOpen: boolean;
  dispatch: React.Dispatch<string>;
}

const OverlayNav = ({
  homepage,
  ismobileMenuOpen,
  dispatch,
}: OverlayNavProps) => {
  return (
    <Box
      className={`${styles['mobile-header-link-container']} ${
        ismobileMenuOpen ? styles['active'] : ''
      }`}
    >
      <Box className={styles['mobile-header-link-container-top-nav']}>
        <Image src={HeroPageLogo} alt='Wakapadi Logo' />
        <CloseIcon
          className={styles['mobile-header-link-container-top-nav-close']}
          onClick={() => dispatch('CLOSE')}
        />
      </Box>

      <Box
        className={
          homepage
            ? styles['mobile-header-link-container-links']
            : `${styles['mobile-header-link-container-links']} ${styles['mobile-header-link-container-links-not-homepage']}`
        }
      >
        <Link href='#' className={styles['header-link']}>
          Who is Nearby
        </Link>
        <Link href='#' className={styles['header-link']}>
          About
        </Link>
        <Link href='#' className={styles['header-link']}>
          Contact
        </Link>
        <Link>Log in</Link>
        <Box className={styles['mobile-header-link-container-language']}>
          {/* Language Icon and Text */}
          <LanguageIcon width='30px' height='30px' />
          <select name='language' id='language'>
            <option value='english'>English</option>
            <option value='french'>French</option>
            <option value='spanish'>Spanish</option>
            <option value='german'>German</option>
          </select>
          {/* <Typography variant='body1'>English</Typography> */}
        </Box>
        <Button>Sign up</Button>
      </Box>
    </Box>
  );
};

export default OverlayNav;
