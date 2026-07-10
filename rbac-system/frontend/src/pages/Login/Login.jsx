import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { sendOTP, verifyOTP, registerUser } from '../../services/authService';
import { validateMobile, validateOTP, validateName } from '../../utils/validators';
import { ROLES, ROLE_LABELS, ROLE_COLORS } from '../../constants/roles';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import './Login.css';

const STEPS = {
  MOBILE: 'MOBILE',
  OTP: 'OTP',
  REGISTER: 'REGISTER',
};

const ROLE_OPTIONS = [
  { value: ROLES.USER,        label: 'User',        icon: '👤', desc: 'View own profile only' },
  { value: ROLES.MANAGER,     label: 'Manager',     icon: '📊', desc: 'View and manage users' },
  { value: ROLES.ADMIN,       label: 'Admin',       icon: '🛡️',  desc: 'Manage users & view logs' },
  { value: ROLES.SUPER_ADMIN, label: 'Super Admin', icon: '👑', desc: 'Full system access' },
];

const Login = () => {
  const { login } = useAuth();

  const [step, setStep]           = useState(STEPS.MOBILE);
  const [mobile, setMobile]       = useState('');
  const [otp, setOtp]             = useState('');
  const [name, setName]           = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState({});
  const [devOtp, setDevOtp]       = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [resendTimer, setResendTimer] = useState(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => { if (resendTimer) clearInterval(resendTimer); };
  }, [resendTimer]);

  const startCountdown = (seconds) => {
    setCountdown(seconds);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    setResendTimer(interval);
  };

  // ─── Step 1: Send OTP ────────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    const mobileErr = validateMobile(mobile);
    if (mobileErr) { setErrors({ mobile: mobileErr }); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await sendOTP(mobile);
      if (res.data?.otp) setDevOtp(res.data.otp);
      toast.success('OTP sent successfully!');
      setStep(STEPS.OTP);
      startCountdown(res.data?.expiresIn || 60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ──────────────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpErr = validateOTP(otp);
    if (otpErr) { setErrors({ otp: otpErr }); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await verifyOTP(mobile, otp);
      if (resendTimer) clearInterval(resendTimer);

      if (res.data?.isNewUser) {
        // New user → go to role selection
        toast.success('OTP verified! Please complete your profile.');
        setStep(STEPS.REGISTER);
      } else {
        // Existing user → login directly
        login(res.data.token, res.data.user);
        toast.success(`Welcome back, ${res.data.user.name}!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 3: Register (new users) ────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    const nameErr = validateName(name);
    if (nameErr) { setErrors({ name: nameErr }); return; }
    if (!selectedRole) { setErrors({ role: 'Please select a role.' }); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await registerUser(mobile, name, selectedRole);
      login(res.data.token, res.data.user);
      toast.success(`Welcome, ${res.data.user.name}! Account created successfully.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Resend OTP ──────────────────────────────────────────────────────────
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setOtp(''); setDevOtp(null); setLoading(true);
    try {
      const res = await sendOTP(mobile);
      if (res.data?.otp) setDevOtp(res.data.otp);
      toast.success('OTP resent successfully!');
      startCountdown(res.data?.expiresIn || 60);
    } catch {
      toast.error('Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeMobile = () => {
    setStep(STEPS.MOBILE);
    setOtp(''); setDevOtp(null); setErrors({});
    if (resendTimer) clearInterval(resendTimer);
    setCountdown(0);
  };

  // ─── Step labels ─────────────────────────────────────────────────────────
  const stepLabels = [
    { num: 1, label: 'Mobile', done: step !== STEPS.MOBILE },
    { num: 2, label: 'Verify OTP', done: step === STEPS.REGISTER },
    { num: 3, label: 'Setup Profile', done: false },
  ];

  const currentStepIdx = step === STEPS.MOBILE ? 0 : step === STEPS.OTP ? 1 : 2;

  return (
    <div className="login-page">
      <div className="login-container">

        {/* ── Left Panel ─────────────────────────────────────────────── */}
        <div className="login-left">
          <div className="login-left-content">
            <div className="login-logo">🔐</div>
            <h1 className="login-tagline">Secure Access,<br />Every Time</h1>
            <p className="login-desc">
              Role-Based Access Control system with OTP authentication,
              JWT security, and comprehensive audit logging.
            </p>
            <div className="login-features">
              {[
                { icon: '✅', text: 'OTP-based authentication' },
                { icon: '🛡️', text: 'Role-based permissions' },
                { icon: '📋', text: 'Complete audit trail' },
                { icon: '🔑', text: 'JWT-secured APIs' },
              ].map((f) => (
                <div key={f.text} className="feature-item">
                  <span className="feature-icon">{f.icon}</span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Panel ────────────────────────────────────────────── */}
        <div className="login-right">
          <div className="login-form-card">

            {/* Header */}
            <div className="login-form-header">
              <h2 className="login-form-title">
                {step === STEPS.MOBILE   && 'Sign In'}
                {step === STEPS.OTP      && 'Verify OTP'}
                {step === STEPS.REGISTER && 'Complete Profile'}
              </h2>
              <p className="login-form-subtitle">
                {step === STEPS.MOBILE   && 'Enter your mobile number to get started'}
                {step === STEPS.OTP      && `Enter the 6-digit OTP sent to +91 ${mobile}`}
                {step === STEPS.REGISTER && 'Enter your name and choose your role'}
              </p>
            </div>

            {/* Step Indicator */}
            <div className="step-indicator">
              {stepLabels.map((s, i) => (
                <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: i < stepLabels.length - 1 ? 1 : 'none' }}>
                  <div className={`step ${i === currentStepIdx ? 'active' : s.done ? 'done' : ''}`}>
                    <div className="step-circle">{s.done ? '✓' : s.num}</div>
                    <span>{s.label}</span>
                  </div>
                  {i < stepLabels.length - 1 && <div className="step-line" />}
                </div>
              ))}
            </div>

            {/* ── STEP 1: Mobile Input ──────────────────────────────── */}
            {step === STEPS.MOBILE && (
              <form onSubmit={handleSendOTP} noValidate>
                <Input
                  id="mobile"
                  label="Mobile Number"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
                    setErrors((p) => ({ ...p, mobile: null }));
                  }}
                  error={errors.mobile}
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="tel"
                  autoFocus
                />

                {/* Sample credentials */}
                <div className="sample-credentials">
                  <p className="sample-title">🧪 Sample Credentials</p>
                  <div className="sample-grid">
                    {[
                      { mobile: '9000000001', role: 'Super Admin' },
                      { mobile: '9000000002', role: 'Admin' },
                      { mobile: '9000000003', role: 'Manager' },
                      { mobile: '9000000004', role: 'User' },
                    ].map((s) => (
                      <button key={s.mobile} type="button" className="sample-btn" onClick={() => setMobile(s.mobile)}>
                        <span className="sample-mobile">{s.mobile}</span>
                        <span className="sample-role">{s.role}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button type="submit" fullWidth size="lg" loading={loading}>
                  Send OTP →
                </Button>
              </form>
            )}

            {/* ── STEP 2: OTP Verification ──────────────────────────── */}
            {step === STEPS.OTP && (
              <form onSubmit={handleVerifyOTP} noValidate>
                {devOtp && (
                  <div className="dev-otp-banner">
                    <div className="dev-otp-label">
                      <span>🔧</span>
                      <span>Your OTP (use this to verify)</span>
                    </div>
                    <div className="dev-otp-value">{devOtp}</div>
                    <p className="dev-otp-note">Copy this OTP and paste it in the field below</p>
                  </div>
                )}

                <Input
                  id="otp"
                  label="One-Time Password"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setErrors((p) => ({ ...p, otp: null }));
                  }}
                  error={errors.otp}
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                />

                {countdown > 0
                  ? <p className="otp-timer">OTP expires in <strong>{countdown}s</strong></p>
                  : <p className="otp-expired-msg">OTP expired. Please resend.</p>
                }

                <Button type="submit" fullWidth size="lg" loading={loading} disabled={otp.length !== 6}>
                  Verify OTP →
                </Button>

                <div className="otp-actions">
                  <button type="button" className={`resend-btn ${countdown > 0 ? 'disabled' : ''}`}
                    onClick={handleResendOTP} disabled={countdown > 0 || loading}>
                    {countdown > 0 ? `Resend in ${countdown}s` : '↺ Resend OTP'}
                  </button>
                  <button type="button" className="change-mobile-btn" onClick={handleChangeMobile}>
                    ← Change Mobile
                  </button>
                </div>
              </form>
            )}

            {/* ── STEP 3: Role Selection (new users only) ───────────── */}
            {step === STEPS.REGISTER && (
              <form onSubmit={handleRegister} noValidate>
                <div className="register-mobile-info">
                  <span>📱</span>
                  <span>{mobile}</span>
                  <span className="new-user-badge">New User</span>
                </div>

                <Input
                  id="reg-name"
                  label="Your Name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((p) => ({ ...p, name: null }));
                  }}
                  error={errors.name}
                  autoFocus
                />

                <div className="form-group">
                  <label className="form-label">Select Your Role</label>
                  {errors.role && <p className="form-error" role="alert">{errors.role}</p>}
                  <div className="role-selection-grid">
                    {ROLE_OPTIONS.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        className={`role-option-card ${selectedRole === r.value ? 'selected' : ''}`}
                        onClick={() => { setSelectedRole(r.value); setErrors((p) => ({ ...p, role: null })); }}
                        style={{ '--role-color': ROLE_COLORS[r.value] }}
                      >
                        <span className="role-option-icon">{r.icon}</span>
                        <span className="role-option-label">{r.label}</span>
                        <span className="role-option-desc">{r.desc}</span>
                        {selectedRole === r.value && (
                          <span className="role-option-check">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Button type="submit" fullWidth size="lg" loading={loading} disabled={!selectedRole || !name.trim()}>
                  Create Account →
                </Button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
