const GlobeFallback = () => {
  return (
    <div className='md:-mt-8 md:ml-20 flex justify-center items-center'>
      <div
        className='rounded-full bg-cover bg-center'
        style={{
          width: 'min(550px, 80vw)',
          height: 'min(550px, 80vw)',
          backgroundImage: "url('/earth-texture.jpg')",
          boxShadow: '0 0 80px 8px rgba(155, 9, 1, 0.35)',
        }}
        role='img'
        aria-label='Satori Ventures global presence'
      />
    </div>
  );
};

export default GlobeFallback;
