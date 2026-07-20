import { Component } from 'react';

// Catches render-time crashes so a broken page shows WHAT broke instead of a
// blank screen. React unmounts the whole tree on an uncaught render error —
// which is why a single bad value used to leave nothing on screen and nothing
// obvious in the console.
//
// Class component on purpose: componentDidCatch has no hook equivalent.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('[ASCEND] Render error:', error);
    console.error('[ASCEND] Component stack:', info?.componentStack);
  }

  render() {
    const { error, info } = this.state;
    if (!error) return this.props.children;

    const box = {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: 12,
      background: '#12131A',
      border: '1px solid #2A3352',
      borderRadius: 8,
      padding: '12px 14px',
      color: '#8B9AB3',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      overflowX: 'auto',
      maxHeight: 260,
      overflowY: 'auto',
    };

    return (
      <div style={{
        minHeight: '100vh', background: '#0A0B10', color: '#E6ECF5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{ maxWidth: 760, width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            fontFamily: 'ui-monospace, monospace', fontSize: 11,
            letterSpacing: '0.22em', color: '#FF4D6A',
          }}>
            ⚠ SOMETHING BROKE WHILE RENDERING
          </div>

          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.02em' }}>
            {error?.name ?? 'Error'}: {error?.message ?? String(error)}
          </div>

          {info?.componentStack && (
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.18em', color: '#5C6784', marginBottom: 6 }}>
                COMPONENT STACK
              </div>
              <div style={box}>{info.componentStack.trim()}</div>
            </div>
          )}

          {error?.stack && (
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.18em', color: '#5C6784', marginBottom: 6 }}>
                STACK
              </div>
              <div style={box}>{error.stack}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px', background: '#7C5CFF', border: '1px solid #7C5CFF',
                borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 12,
                letterSpacing: '0.1em', cursor: 'pointer',
              }}
            >
              RELOAD
            </button>
            <button
              onClick={() => { window.location.href = '/dashboard'; }}
              style={{
                padding: '10px 20px', background: 'transparent', border: '1px solid #2A3352',
                borderRadius: 8, color: '#8B9AB3', fontWeight: 700, fontSize: 12,
                letterSpacing: '0.1em', cursor: 'pointer',
              }}
            >
              DASHBOARD
            </button>
          </div>
        </div>
      </div>
    );
  }
}
