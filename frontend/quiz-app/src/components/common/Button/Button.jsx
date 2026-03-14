import styles from './Button.module.scss';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const classes = [
    styles['btn'],
    styles[`btn--${variant}`],
    styles[`btn--${size}`],
    loading ? styles['btn--loading'] : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className={styles['btn__spinner']} aria-hidden="true" />}
      <span className={styles['btn__label']}>{children}</span>
    </button>
  );
};

export default Button;
