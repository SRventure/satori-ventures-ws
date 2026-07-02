const GlobeFallback = () => {
  return (
    <div className='md:-mt-8 md:ml-20 flex justify-center items-center'>
      <div
        className='rounded-full'
        style={{
          width: 'min(550px, 80vw)',
          height: 'min(550px, 80vw)',
          background: 'radial-gradient(circle at 35% 30%, #f7f3f1 0%, #efe8e5 60%, #e7dcd9 100%)',
          boxShadow: '0 0 80px 10px rgba(155, 9, 1, 0.30), inset 0 0 60px 0 rgba(155, 9, 1, 0.10)',
        }}
        role='img'
        aria-label='Satori.Ventures global presence'
      />
    </div>
  );
};

export default GlobeFallback;
