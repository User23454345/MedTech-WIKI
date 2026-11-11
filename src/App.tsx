import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Hub } from './pages/Hub';
import { EntryPage } from './pages/EntryPage';
import { DeviceDb } from './pages/DeviceDb';
import { Compare } from './pages/Compare';
import { SearchPage } from './pages/SearchPage';
import { Glossary } from './pages/Glossary';
import { Sources } from './pages/Sources';
import { Collection } from './pages/Collection';
import { Graph } from './pages/Graph';
import { Methodik } from './pages/Methodik';
import { NotFound } from './pages/NotFound';

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="k/:id" element={<Hub />} />
          <Route path="e/:id" element={<EntryPage />} />
          <Route path="geraete" element={<DeviceDb />} />
          <Route path="vergleich" element={<Compare />} />
          <Route path="suche" element={<SearchPage />} />
          <Route path="glossar" element={<Glossary />} />
          <Route path="quellen" element={<Sources />} />
          <Route path="sammlung" element={<Collection />} />
          <Route path="netz" element={<Graph />} />
          <Route path="methodik" element={<Methodik />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
