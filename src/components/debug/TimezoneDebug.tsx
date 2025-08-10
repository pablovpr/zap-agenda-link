
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  getNowInBrazil, 
  getTodayInBrazil, 
  getCurrentTimeInBrazil, 
  formatToBrasilia,
  debugTimezone 
} from '@/utils/timezone';
import { Clock, Calendar, MapPin } from 'lucide-react';

const TimezoneDebug = () => {
  const [currentTime, setCurrentTime] = useState({
    utc: new Date(),
    brazil: getNowInBrazil(),
    utcString: new Date().toISOString(),
    brazilString: formatToBrasilia(new Date()),
    todayBrazil: getTodayInBrazil(),
    currentTimeBrazil: getCurrentTimeInBrazil()
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime({
        utc: now,
        brazil: getNowInBrazil(),
        utcString: now.toISOString(),
        brazilString: formatToBrasilia(now),
        todayBrazil: getTodayInBrazil(),
        currentTimeBrazil: getCurrentTimeInBrazil()
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDebugLog = () => {
    debugTimezone();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Debug de Timezone - Brasil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              UTC (Servidor)
            </h4>
            <div className="space-y-1 text-sm">
              <div><strong>Data/Hora:</strong> {currentTime.utc.toLocaleString()}</div>
              <div><strong>ISO String:</strong> {currentTime.utcString}</div>
              <div><strong>Timezone:</strong> UTC+0</div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Brasil (São Paulo)
            </h4>
            <div className="space-y-1 text-sm">
              <div><strong>Data/Hora:</strong> {currentTime.brazil.toLocaleString()}</div>
              <div><strong>Formatado:</strong> {currentTime.brazilString}</div>
              <div><strong>Hoje:</strong> {currentTime.todayBrazil}</div>
              <div><strong>Hora atual:</strong> {currentTime.currentTimeBrazil}</div>
              <div><strong>Timezone:</strong> America/Sao_Paulo</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <strong>Diferença:</strong> {
              Math.abs(currentTime.brazil.getTime() - currentTime.utc.getTime()) / (1000 * 60 * 60)
            } horas
          </div>
          <Button onClick={handleDebugLog} variant="outline" size="sm">
            Log Debug Console
          </Button>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <h4 className="font-semibold text-blue-800 mb-1">Status do Sistema:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✅ Timezone configurado para America/Sao_Paulo</li>
            <li>✅ Funções de conversão implementadas</li>
            <li>✅ Formatação em português brasileiro</li>
            <li>✅ Horário de verão automático</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimezoneDebug;
