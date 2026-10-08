import { ConfiguracionHorario, HorarioDia } from './types';

export const HORARIO_DEFAULT: ConfiguracionHorario = {
  habilitado: true,
  modoForzado: 'auto',
  mensajeCerrado: 'Local cerrado en este momento. Revisa nuestros horarios de atención.',
  dias: [
    { dia: 1, nombre: 'Lunes', abierto: true, horaApertura: '11:00', horaCierre: '22:00' },
    { dia: 2, nombre: 'Martes', abierto: true, horaApertura: '11:00', horaCierre: '22:00' },
    { dia: 3, nombre: 'Miércoles', abierto: true, horaApertura: '11:00', horaCierre: '22:00' },
    { dia: 4, nombre: 'Jueves', abierto: true, horaApertura: '11:00', horaCierre: '22:00' },
    { dia: 5, nombre: 'Viernes', abierto: true, horaApertura: '11:00', horaCierre: '22:00' },
    { dia: 6, nombre: 'Sábado', abierto: true, horaApertura: '11:00', horaCierre: '22:00' },
    { dia: 0, nombre: 'Domingo', abierto: true, horaApertura: '11:00', horaCierre: '22:00' },
  ],
};

const NOMBRES_DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/**
 * Obtiene la fecha y hora oficial de Chile (Zona horaria 'America/Santiago')
 */
export function getFechaHoraChile() {
  const ahora = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(ahora);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const year = parseInt(partMap.year, 10);
  const month = parseInt(partMap.month, 10) - 1;
  const day = parseInt(partMap.day, 10);
  const hour = parseInt(partMap.hour, 10);
  const minute = parseInt(partMap.minute, 10);

  // Instancia ficticia en hora local para obtener getDay() del día en Santiago
  const santiagoDate = new Date(year, month, day, hour, minute);
  const diaSemana = santiagoDate.getDay(); // 0 = Domingo, 1 = Lunes, etc.

  const pad = (n: number) => n.toString().padStart(2, '0');
  const horaStr = `${pad(hour)}:${pad(minute)}`;
  const fechaStr = `${pad(day)}/${pad(month + 1)}/${year}`;
  const minutosDesdeMedianoche = hour * 60 + minute;

  return {
    diaSemana,
    diaNombre: NOMBRES_DIAS[diaSemana],
    hora: hour,
    minuto: minute,
    minutosDesdeMedianoche,
    fechaStr,
    horaStr,
  };
}

/**
 * Convierte un string "HH:mm" en minutos desde la medianoche
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map((x) => parseInt(x, 10) || 0);
  return h * 60 + m;
}

export interface EstadoHorario {
  estaAbierto: boolean;
  motivo: string;
  horaChileStr: string;
  diaChileNombre: string;
  horarioHoyTexto: string;
  proximaApertura?: string;
  mensajePersonalizado?: string;
}

/**
 * Verifica si el local está abierto según la configuración y la hora chilena
 */
export function verificarEstadoHorario(config?: ConfiguracionHorario): EstadoHorario {
  const conf = config && config.dias && config.dias.length > 0 ? config : HORARIO_DEFAULT;
  const chile = getFechaHoraChile();

  // 1. Si el sistema de validación está deshabilitado
  if (conf.habilitado === false) {
    return {
      estaAbierto: true,
      motivo: 'Horario libre',
      horaChileStr: chile.horaStr,
      diaChileNombre: chile.diaNombre,
      horarioHoyTexto: 'Atención continua',
    };
  }

  // 2. Modos Forzados por el Dueño
  if (conf.modoForzado === 'abierto') {
    return {
      estaAbierto: true,
      motivo: 'Abierto manualmente por administración',
      horaChileStr: chile.horaStr,
      diaChileNombre: chile.diaNombre,
      horarioHoyTexto: 'Abierto (Modo manual)',
    };
  }

  if (conf.modoForzado === 'cerrado') {
    return {
      estaAbierto: false,
      motivo: 'Cerrado temporalmente por administración',
      horaChileStr: chile.horaStr,
      diaChileNombre: chile.diaNombre,
      horarioHoyTexto: 'Cerrado temporalmente',
      mensajePersonalizado: conf.mensajeCerrado,
    };
  }

  // 3. Modo Automático: Comprobar jornada de hoy y posible extensión de ayer (madrugada)
  const diaHoy = conf.dias.find((d) => d.dia === chile.diaSemana);
  const diaAyerSemana = (chile.diaSemana + 6) % 7;
  const diaAyer = conf.dias.find((d) => d.dia === diaAyerSemana);

  const minsAhora = chile.minutosDesdeMedianoche;

  // Comprobar si estamos en la madrugada de la jornada de ayer
  // (Ej: Ayer viernes cerraba a las 01:00 am y ahora son las 00:30 del sábado)
  if (diaAyer && diaAyer.abierto) {
    const ayerApertura = timeToMinutes(diaAyer.horaApertura);
    const ayerCierre = timeToMinutes(diaAyer.horaCierre);

    // Cruzó medianoche (ayerCierre < ayerApertura)
    if (ayerCierre < ayerApertura && minsAhora < ayerCierre) {
      return {
        estaAbierto: true,
        motivo: `Abierto (Turno nocturno de ${diaAyer.nombre} hasta las ${diaAyer.horaCierre})`,
        horaChileStr: chile.horaStr,
        diaChileNombre: chile.diaNombre,
        horarioHoyTexto: `Cierra a las ${diaAyer.horaCierre}`,
      };
    }
  }

  // Comprobar la jornada correspondiente a hoy
  if (diaHoy && diaHoy.abierto) {
    const hoyApertura = timeToMinutes(diaHoy.horaApertura);
    const hoyCierre = timeToMinutes(diaHoy.horaCierre);

    let abiertoHoy = false;
    if (hoyCierre > hoyApertura) {
      // Horario normal dentro del mismo día (ej: 18:00 a 23:30)
      abiertoHoy = minsAhora >= hoyApertura && minsAhora < hoyCierre;
    } else {
      // Cruza la medianoche (ej: 18:00 a 01:00)
      abiertoHoy = minsAhora >= hoyApertura;
    }

    if (abiertoHoy) {
      return {
        estaAbierto: true,
        motivo: `Abierto hoy de ${diaHoy.horaApertura} a ${diaHoy.horaCierre}`,
        horaChileStr: chile.horaStr,
        diaChileNombre: chile.diaNombre,
        horarioHoyTexto: `${diaHoy.horaApertura} - ${diaHoy.horaCierre}`,
      };
    }
  }

  // Si llegamos aquí, el local está CERRADO
  let horarioHoyTexto = 'Cerrado hoy';
  if (diaHoy && diaHoy.abierto) {
    horarioHoyTexto = `Hoy atiende de ${diaHoy.horaApertura} a ${diaHoy.horaCierre}`;
  }

  // Buscar próxima apertura
  let proximaApertura = '';
  // ¿Abre más tarde hoy?
  if (diaHoy && diaHoy.abierto) {
    const hoyApertura = timeToMinutes(diaHoy.horaApertura);
    if (minsAhora < hoyApertura) {
      proximaApertura = `Hoy a las ${diaHoy.horaApertura} hrs`;
    }
  }

  // Si no abre hoy o ya pasó la hora, buscar los próximos días
  if (!proximaApertura) {
    for (let i = 1; i <= 7; i++) {
      const siguienteDiaIndex = (chile.diaSemana + i) % 7;
      const siguienteDia = conf.dias.find((d) => d.dia === siguienteDiaIndex);
      if (siguienteDia && siguienteDia.abierto) {
        const diaNombre = i === 1 ? 'Mañana' : siguienteDia.nombre;
        proximaApertura = `${diaNombre} a las ${siguienteDia.horaApertura} hrs`;
        break;
      }
    }
  }

  return {
    estaAbierto: false,
    motivo: diaHoy && diaHoy.abierto ? 'Fuera de horario de atención' : 'Cerrado por día de descanso',
    horaChileStr: chile.horaStr,
    diaChileNombre: chile.diaNombre,
    horarioHoyTexto,
    proximaApertura,
    mensajePersonalizado: conf.mensajeCerrado,
  };
}
