   const HomePageContent = dynamic(
     () => import('@/components/HomePageContent'),
     { ssr: false }
   );

   const IndexPageContainer: React.FC = () => {
     return <HomePageContent />;
   };

   export default IndexPageContainer;
   ```
