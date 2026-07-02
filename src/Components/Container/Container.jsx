
const Container = ({ children, className = '' }) => {
  return (
    <div className={`max-w-[2520px] mx-auto xl:px-40 md:px-16 sm:px-2 px-4 ${className}`}>
      {children}
    </div>
  );
};

export default Container;
