import GameCanvas from '@/components/GameCanvas';

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-5xl">
        <GameCanvas />
      </div>
    </div>
  );
};

export default Index;
