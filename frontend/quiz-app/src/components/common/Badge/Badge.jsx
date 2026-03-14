import styles from './Badge.module.scss';

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const classes = [
    styles['badge'],
    styles[`badge--${variant}`],
    styles[`badge--${size}`],
    className,
  ].filter(Boolean).join(' ');

  return <span className={classes}>{children}</span>;
};

export default Badge;
