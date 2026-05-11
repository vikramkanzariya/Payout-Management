const Spinner = ({ size = 'md', text = '' }) => (
  <div className={`spinner-wrapper spinner-wrapper--${size}`}>
    <div className={`spinner spinner--${size}`} />
    {text && <span className="spinner-text">{text}</span>}
  </div>
);

export const PageLoader = () => (
  <div className="page-loader">
    <Spinner size="lg" text="Loading..." />
  </div>
);

export default Spinner;
