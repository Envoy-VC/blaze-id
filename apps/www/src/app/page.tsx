import dynamic from 'next/dynamic';

const Hero = dynamic(() => import('../components/hero'), {
  ssr: false,
});
const Home = () => {
  return <Hero />;
};

export default Home;
