import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ApiError } from "../api/client";
import { useAuth } from "../components/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signup(email, password, nickname);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "회원가입에 실패했습니다.");
      setPassword("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card auth-card">
      <p className="eyebrow">Start your log</p>
      <h1>회원가입</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label>이메일
          <input autoComplete="email" inputMode="email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>비밀번호
          <input autoComplete="new-password" minLength={8} required type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <span className="field-help">8자 이상 입력해주세요.</span>
        </label>
        <label>닉네임
          <input autoComplete="nickname" maxLength={20} minLength={2} pattern="[가-힣A-Za-z0-9_]{2,20}" required value={nickname} onChange={(event) => setNickname(event.target.value)} />
          <span className="field-help">2~20자의 한글, 영문, 숫자, 밑줄을 사용할 수 있어요.</span>
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="button" disabled={submitting} type="submit">{submitting ? "계정 만드는 중…" : "회원가입"}</button>
      </form>
      <p className="form-switch">이미 계정이 있나요? <Link to="/login">로그인</Link></p>
    </section>
  );
}
