import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
  );
