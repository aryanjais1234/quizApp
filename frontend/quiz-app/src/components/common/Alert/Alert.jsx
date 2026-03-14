import styles from './Alert.module.scss';

const Alert = ({ children, variant = 'info', className = '' }) => {
  const classes = [
    styles['alert'],
    styles[`alert--${variant}`],
    className,
  ].filter(Boolean).join(' ');

  return <div className={classes} role="alert">{children}</div>;
};

export default Alert;
