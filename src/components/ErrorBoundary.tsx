import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  errorStr: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorStr: ""
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorStr: error.toString() + "\n" + error.stack };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', backgroundColor: 'black', whiteSpace: 'pre-wrap', zIndex: 9999, position: 'relative' }}>
          <h2>ERROR in {this.props.name || "Component"}</h2>
          <pre style={{fontSize: '11px'}}>{this.state.errorStr}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
