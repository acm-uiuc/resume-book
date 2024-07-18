import React from 'react';
import { Link } from 'react-router-dom';
import brandImgUrl from '@/banner-blue.png'

interface LogoBadgeProps {
  size?: string;
  linkTo?: string;
  showText?: boolean;
}

const LogoBadge: React.FC<LogoBadgeProps> = ({ size, linkTo, showText }) => {
  if (!showText) {
    showText = true;
  }
  if (!size) {
    size = '1em';
  }
  return (
    <b>
      <Link
        to={linkTo || '/'}
        style={{
          fontSize: size,
          textDecoration: 'none',
          color: '#0053B3',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <img
          src={brandImgUrl}
          alt="ACM Logo"
          style={{ height: '2em', marginRight: '0.5em' }}
        />
        {showText ? 'Resume Book' : null}
      </Link>
    </b>
  );
};

export default LogoBadge;
