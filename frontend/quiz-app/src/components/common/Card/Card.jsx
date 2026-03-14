import PropTypes from 'prop-types';
import styles from './Card.module.scss';

const Card = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  padding = 'md',
  ...props
}) => {
  const classes = [
    styles['card'],
    hoverable ? styles['card--hoverable'] : '',
    onClick ? styles['card--clickable'] : '',
    styles[`card--pad-${padding}`],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={`${styles['card__header']} ${className}`}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className = '' }) {
  return (
    <div className={`${styles['card__body']} ${className}`}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={`${styles['card__footer']} ${className}`}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,
  hoverable: PropTypes.bool,
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
};

Card.Header.propTypes = { children: PropTypes.node, className: PropTypes.string };
Card.Body.propTypes  = { children: PropTypes.node, className: PropTypes.string };
Card.Footer.propTypes = { children: PropTypes.node, className: PropTypes.string };

export default Card;
