# Capstone Report README (LaTeX + Generated SVG Diagrams)

This file documents how to use the final LaTeX report with the Mermaid diagrams generated in this repository.

## Diagram Files Available

All generated diagram files are in `diagrams/`:

- `diagrams/use-case-user-owner-admin.svg`
- `diagrams/booking-payment-sequence.svg`
- `diagrams/dashboard-data-aggregation-flow.svg`
- `diagrams/module-interaction-diagram.svg`
- `diagrams/booking-lifecycle-state-diagram.svg`
- `diagrams/testing-pyramid-electrorent.svg`
- `diagrams/deployment-architecture-vercel-render-atlas.svg`

Additional architecture file:

- `system-architecture.svg` (or generate from `system-architecture.mmd`)

## LaTeX Setup (required)

Ensure these packages are present:

```latex
\usepackage{graphicx}
\usepackage{svg}
\usepackage{float}
```

## Replace Placeholder Figures with SVG Diagrams

Use the following blocks in your LaTeX where placeholders currently exist.

### 1) System Architecture
```latex
\begin{figure}[H]
\centering
\includesvg[width=0.95\textwidth]{system-architecture}
\caption{High-Level System Architecture of ElectroRent}
\label{fig:system-architecture}
\end{figure}
```

### 2) Use Case Diagram
```latex
\begin{figure}[H]
\centering
\includesvg[width=0.95\textwidth]{diagrams/use-case-user-owner-admin}
\caption{Use Case Diagram for User, Owner, and Admin Roles}
\label{fig:usecase-diagram}
\end{figure}
```

### 3) Booking and Payment Sequence
```latex
\begin{figure}[H]
\centering
\includesvg[width=0.95\textwidth]{diagrams/booking-payment-sequence}
\caption{Booking and Payment Confirmation Sequence Diagram}
\label{fig:booking-sequence}
\end{figure}
```

### 4) Dashboard Data Aggregation Flow
```latex
\begin{figure}[H]
\centering
\includesvg[width=0.95\textwidth]{diagrams/dashboard-data-aggregation-flow}
\caption{Dashboard Data Aggregation Flow Diagram}
\label{fig:dashboard-flow}
\end{figure}
```

### 5) Module Interaction Diagram
```latex
\begin{figure}[H]
\centering
\includesvg[width=0.95\textwidth]{diagrams/module-interaction-diagram}
\caption{Module Interaction Diagram}
\label{fig:module-interaction}
\end{figure}
```

### 6) Booking Lifecycle State Diagram
```latex
\begin{figure}[H]
\centering
\includesvg[width=0.95\textwidth]{diagrams/booking-lifecycle-state-diagram}
\caption{Booking Lifecycle State Diagram}
\label{fig:state-machine-booking}
\end{figure}
```

### 7) Testing Pyramid
```latex
\begin{figure}[H]
\centering
\includesvg[width=0.85\textwidth]{diagrams/testing-pyramid-electrorent}
\caption{Testing Pyramid for ElectroRent}
\label{fig:test-pyramid}
\end{figure}
```

### 8) Deployment Architecture
```latex
\begin{figure}[H]
\centering
\includesvg[width=0.95\textwidth]{diagrams/deployment-architecture-vercel-render-atlas}
\caption{Deployment Architecture (Frontend: Vercel, Backend: Render, Database: MongoDB Atlas)}
\label{fig:deployment-architecture}
\end{figure}
```

## If Any Diagram Is Missing

Use this fallback placeholder block:

```latex
\begin{figure}[H]
\centering
\fbox{\begin{minipage}[c][5.5cm][c]{0.9\textwidth}\centering
Image Placeholder\\
Insert final diagram here
\end{minipage}}
\caption{<Diagram Caption>}
\label{fig:<diagram-label>}
\end{figure}
```

## Compile Notes (Overleaf / Local)

- For SVG support in Overleaf, enable shell-escape if needed.
- If SVG rendering fails, export SVG to PDF/PNG and use `\includegraphics{...}` instead.

## Quick Conversion Alternative (if needed)

If you want PNG/PDF versions, convert locally and swap to `\includegraphics`.

---

Maintained for report integration with generated Mermaid diagrams.
