import { StageWrapper } from './components/Canvas/StageWrapper';
import { LayerPanel } from './components/Sidebar/LayerPanel';
import { Toolbar } from './components/Toolbar/Toolbar';

function App() {
  return (
    <div className="w-screen h-screen flex flex-col font-hina">
      {/* Main Workspace */}
      <main
        className="flex-1 relative flex overflow-hidden"
        style={{
          backgroundImage: 'url(/grid-pattern.webp)',
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto'
        }}
      >
        <div className="flex absolute top-5 left-5 gap-2">
          <img src="/logo.webp" alt="Logo" className="w-10" />
          <div className="font-bold text-3xl font-sans">karauzel</div>
        </div>
        <div className="flex-1 relative">
          <Toolbar />
          <StageWrapper />
        </div>
        <LayerPanel />
      </main>
    </div>
  );
}

export default App;
