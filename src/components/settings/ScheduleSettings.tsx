import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Save, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
interface DaySchedule {
  day_of_week: number;
  is_active: boolean;
  start_time: string;
  end_time: string;
  lunch_start?: string;
  lunch_end?: string;
  has_lunch_break: boolean;
}
interface ScheduleSettingsProps {
  onScheduleUpdate?: () => void;
}
const ScheduleSettings = ({
  onScheduleUpdate
}: ScheduleSettingsProps) => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dayNames = {
    1: 'Segunda-feira',
    2: 'Terça-feira',
    3: 'Quarta-feira',
    4: 'Quinta-feira',
    5: 'Sexta-feira',
    6: 'Sábado',
    0: 'Domingo'
  };
  const defaultSchedule: Omit<DaySchedule, 'day_of_week'> = {
    is_active: true,
    start_time: '09:00',
    end_time: '18:00',
    lunch_start: '12:00',
    lunch_end: '13:00',
    has_lunch_break: false
  };
  useEffect(() => {
    if (user) {
      loadSchedules();
    }
  }, [user]);
  const loadSchedules = async () => {
    setLoading(true);
    try {
      // Since daily_schedules table exists but not in types, use direct query with any cast
      const {
        data,
        error
      } = await (supabase as any).from('daily_schedules').select('*').eq('company_id', user!.id).order('day_of_week');
      if (error) {
        console.error('❌ Error loading schedules:', error);
        throw error;
      }

      // Initialize all days if not exists
      const existingDays = data?.map(d => d.day_of_week) || [];
      const allDays = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
      const completeSchedules: DaySchedule[] = [];
      for (const dayNum of allDays) {
        const existing = data?.find(d => d.day_of_week === dayNum);
        if (existing) {
          completeSchedules.push(existing);
        } else {
          completeSchedules.push({
            day_of_week: dayNum,
            ...defaultSchedule,
            is_active: dayNum >= 1 && dayNum <= 5 // Monday to Friday active by default
          });
        }
      }
      setSchedules(completeSchedules);
    } catch (error: any) {
      console.error('❌ Erro ao carregar horários:', error);
      setError(error.message || 'Erro desconhecido');
      toast({
        title: "Erro",
        description: "Não foi possível carregar os horários.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const updateSchedule = (dayOfWeek: number, updates: Partial<DaySchedule>) => {
    setSchedules(prev => prev.map(schedule => schedule.day_of_week === dayOfWeek ? {
      ...schedule,
      ...updates
    } : schedule));
    setHasChanges(true);
  };
  const saveSchedules = async () => {
    setSaving(true);
    try {
      // Delete existing schedules
      await (supabase as any).from('daily_schedules').delete().eq('company_id', user!.id);

      // Insert new schedules
      const schedulesToInsert = schedules.map(schedule => ({
        company_id: user!.id,
        day_of_week: schedule.day_of_week,
        is_active: schedule.is_active,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        lunch_start: schedule.has_lunch_break ? schedule.lunch_start : null,
        lunch_end: schedule.has_lunch_break ? schedule.lunch_end : null,
        has_lunch_break: schedule.has_lunch_break
      }));
      const {
        error
      } = await (supabase as any).from('daily_schedules').insert(schedulesToInsert);
      if (error) throw error;
      setHasChanges(false);
      toast({
        title: "Horários salvos!",
        description: "As configurações foram atualizadas com sucesso."
      });

      // Notify parent component
      if (onScheduleUpdate) {
        onScheduleUpdate();
      }
    } catch (error) {
      console.error('Erro ao salvar horários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os horários.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };


  if (!user) {
    return <Card className="bg-white border-gray-200 shadow-lg">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-base md:text-lg text-red-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-600" />
            ❌ Erro de Autenticação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 py-4">Usuário não autenticado. Faça login novamente.</p>
        </CardContent>
      </Card>;
  }
  if (error) {
    return <Card className="bg-white border-gray-200 shadow-lg">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-base md:text-lg text-red-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-600" />
            ❌ Erro ao Carregar Horários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-4 space-y-2">
            <p className="text-red-600">Erro: {error}</p>
            <Button onClick={() => {
            setError(null);
            loadSchedules();
          }} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>;
  }
  if (loading) {
    return <Card className="bg-white border-gray-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardTitle className="text-base md:text-lg text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            ⏰ Configuração de Horários por Dia
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Configure horários independentes para cada dia da semana
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-gray-700">Carregando configurações de horários...</span>
          </div>
          <div className="text-xs text-gray-500 text-center mt-2">
            Debug: User ID = {user?.id}
          </div>
        </CardContent>
      </Card>;
  }
  return (
    <Card className="bg-white border-gray-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardTitle className="text-base md:text-lg text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          ⏰ Horários de Funcionamento
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Configure os horários de cada dia da semana
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4 p-4 sm:p-6">
        {schedules.map(schedule => (
          <div key={schedule.day_of_week} className="space-y-3">
            {/* Linha principal do dia */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2">
              {/* Nome do dia e status */}
              <div className="flex items-center justify-between sm:block">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900 text-base">
                    {dayNames[schedule.day_of_week as keyof typeof dayNames]}
                  </span>
                  {!schedule.is_active && (
                    <span className="text-sm text-gray-500">Fechado</span>
                  )}
                </div>
                
                {/* Switch mobile (aparece só no mobile) */}
                <div className="sm:hidden">
                  <Switch
                    checked={schedule.is_active}
                    onCheckedChange={(checked) => updateSchedule(schedule.day_of_week, { is_active: checked })}
                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-400"
                  />
                </div>
              </div>
              
              {/* Horários de funcionamento quando ativo */}
              {schedule.is_active && (
                <div className="flex items-center gap-2 sm:gap-3 justify-center">
                  {/* Campo "Abre" */}
                  <div className="flex flex-col items-center">
                    <Label className="text-xs text-gray-600 mb-1">Abre</Label>
                    <Input
                      type="time"
                      value={schedule.start_time}
                      onChange={(e) => updateSchedule(schedule.day_of_week, { start_time: e.target.value })}
                      className="w-20 sm:w-24 h-10 sm:h-12 text-center text-base sm:text-lg font-medium border-2 border-gray-300 rounded-xl"
                    />
                  </div>
                  
                  {/* Separador */}
                  <div className="flex items-center pt-6">
                    <span className="text-gray-400 text-lg">–</span>
                  </div>
                  
                  {/* Campo "Fecha" */}
                  <div className="flex flex-col items-center">
                    <Label className="text-xs text-gray-600 mb-1">Fecha</Label>
                    <Input
                      type="time"
                      value={schedule.end_time}
                      onChange={(e) => updateSchedule(schedule.day_of_week, { end_time: e.target.value })}
                      className="w-20 sm:w-24 h-10 sm:h-12 text-center text-base sm:text-lg font-medium border-2 border-gray-300 rounded-xl"
                    />
                  </div>
                </div>
              )}
              
              {/* Switch Desktop (aparece só no desktop) */}
              <div className="hidden sm:flex items-center gap-2">
                <Switch
                  checked={schedule.is_active}
                  onCheckedChange={(checked) => updateSchedule(schedule.day_of_week, { is_active: checked })}
                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-400"
                />
              </div>
            </div>
            
            {/* Botão de Intervalo de Almoço */}
            {schedule.is_active && (
              <div className="ml-4">
                {!schedule.has_lunch_break ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateSchedule(schedule.day_of_week, { has_lunch_break: true })}
                    className="text-gray-600 hover:text-gray-800 font-normal text-sm p-0 h-auto"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Intervalo de almoço
                  </Button>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-2">
                    {/* Campos de horário de almoço */}
                    <div className="flex items-center gap-2 sm:gap-3 justify-center">
                      {/* Campo "Início" almoço */}
                      <div className="flex flex-col items-center">
                        <Label className="text-xs text-gray-600 mb-1">Início</Label>
                        <Input
                          type="time"
                          value={schedule.lunch_start || '12:00'}
                          onChange={(e) => updateSchedule(schedule.day_of_week, { lunch_start: e.target.value })}
                          className="w-20 sm:w-24 h-10 sm:h-12 text-center text-base sm:text-lg font-medium border-2 border-gray-300 rounded-xl"
                        />
                      </div>
                      
                      {/* Separador */}
                      <div className="flex items-center pt-6">
                        <span className="text-gray-400 text-lg">–</span>
                      </div>
                      
                      {/* Campo "Fim" almoço */}
                      <div className="flex flex-col items-center">
                        <Label className="text-xs text-gray-600 mb-1">Fim</Label>
                        <Input
                          type="time"
                          value={schedule.lunch_end || '13:00'}
                          onChange={(e) => updateSchedule(schedule.day_of_week, { lunch_end: e.target.value })}
                          className="w-20 sm:w-24 h-10 sm:h-12 text-center text-base sm:text-lg font-medium border-2 border-gray-300 rounded-xl"
                        />
                      </div>
                    </div>
                    
                    {/* Botão para remover intervalo */}
                    <div className="flex justify-center sm:justify-start mt-2 sm:mt-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateSchedule(schedule.day_of_week, { has_lunch_break: false })}
                        className="text-red-600 hover:text-red-800 font-normal text-sm px-3 py-1 h-auto"
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Separador entre dias */}
            {schedule.day_of_week !== 0 && (
              <div className="border-b border-gray-100 pt-3 pb-1"></div>
            )}
          </div>
        ))}
        
        {/* Botão de salvar */}
        {hasChanges && (
          <div className="flex justify-center pt-4 border-t">
            <Button 
              onClick={saveSchedules} 
              disabled={saving} 
              className="bg-green-600 hover:bg-green-700 px-8"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
export default ScheduleSettings;