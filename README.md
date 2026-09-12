# Finance Tracker

Aplicación full-stack de gestión de finanzas personales: registro de ingresos, gastos, compras en cuotas y pagos de servicios, con dashboard de resumen mensual y control de vencimientos futuros.

Proyecto desarrollado para aprender desarrollo full-stack (NestJS + Angular), combinando backend con base de datos relacional, lógica de negocio no trivial (cálculo de fechas de tarjeta de crédito, prorrateo de cuotas, cierres anuales automáticos) y un frontend interactivo.

## Estructura del repositorio

```
finance-tracker/
├── finance-tracker-api/   # Backend — NestJS + TypeORM + SQL Server
└── finance-tracker-app/   # Frontend — Angular + Angular Material
```

## Funcionalidades

- **Dashboard mensual**: ingresos, gastos y balance del mes, desglosados por categoría, con vista de próximos vencimientos.
- **Registro de transacciones**: formulario dinámico que se adapta según el tipo (Compra, Pago de servicio, Ingreso), con validaciones y medios de pago filtrados según el tipo de cuenta.
- **Compras en cuotas**: prorrateo automático del monto entre las cuotas, con cálculo de fechas de vencimiento basado en el día de cierre/vencimiento configurado de cada tarjeta de crédito (soporta cierre por día fijo del mes o por posición de día de la semana, ej. "el segundo jueves de cada mes").
- **Gestión de cuentas**: alta, activación/desactivación (no se puede eliminar una cuenta con movimientos históricos) y configuración de parámetros de tarjeta de crédito.
- **Catálogos**: administración de categorías y medios de pago.
- **Cuotas pendientes**: vista filtrable de todo lo comprometido a futuro, con total acumulado.
- **Cierre anual automático**: job programado (cron) que archiva el año cerrado en un resumen histórico y limpia transacciones ya saldadas.

## Stack técnico

**Backend:**
- NestJS
- TypeORM + SQL Server
- class-validator (validación de DTOs)
- @nestjs/schedule (cron jobs)
- date-fns (cálculo de fechas de tarjeta de crédito)
- Jest (tests unitarios de controllers y services)

**Frontend:**
- Angular
- Angular Material
- RxJS

## Instalación y uso

### Backend

```bash
cd finance-tracker-api
npm install
```

Creá un archivo `.env` en `finance-tracker-api/` basado en `.env.example`, con los datos de tu base de datos SQL Server:

```
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=
```

Levantar el servidor:

```bash
npm run start:dev
```

Por defecto corre en `http://localhost:3000`.

### Frontend

```bash
cd finance-tracker-app
npm install
ng serve
```

La app se abre en `http://localhost:4200` y consume la API configurada en `environment.ts`.

## Modelo de datos (resumen)

El diseño usa un patrón de **clave primaria compartida**: `Gasto` e `Ingreso` heredan el `id` de `Transaccion` (1 a 1), y a su vez `Compra` y `Pago` heredan el `id` de `Gasto`. Esto permite tratar toda transacción de forma unificada (fecha, movimientos asociados) mientras cada tipo específico guarda sus propios campos.

## Estado actual y roadmap

**En progreso:**
- Cierre anual automático (cron job): ya está la tabla SQL, la entidad `ResumenAnual`, el módulo y el service armados. Pendiente de verificar compilación y probar el flujo end-to-end.
- Pulido visual del frontend (pasada de diseño pendiente).

**Backlog / próximas mejoras:**
- Corrimiento de fechas a día hábil cuando el cierre/vencimiento cae en feriado.
- Liquidación anticipada de una compra en cuotas.
- Vincular un pago a una compra específica (hoy son entidades independientes).
- Autenticación de usuarios (hoy la app es de un solo usuario).
- Tests con cobertura real (los actuales son los que genera NestJS por defecto, sin casos de negocio).
- Tests end-to-end del frontend.
- Reportes exportables (PDF/Excel) del resumen mensual.

## Nota

Proyecto de práctica/aprendizaje personal, no está en producción activa.

---

[(https://www.linkedin.com/in/agostina-elli/)]