import { type FormEvent, useEffect, useState } from "react";

import { ApiError } from "../api/client";
import { useAuth } from "../components/AuthContext";

export default function SettingsPage() {
  const { user, updateNickname } = useAuth();
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setNickname(user?.nickname ?? ""), [user?.nickname]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      await updateNickname(nickname);
      setMessage("닉네임을 변경했습니다.");
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "닉네임을 변경하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card page-card">
      <p className="eyebrow">Account</p>
      <h1>계정 설정</h1>
      <dl className="account-info"><div><dt>이메일</dt><dd>{user?.email}</dd></div></dl>
      <form className="form" onSubmit={handleSubmit}>
        <label>새 닉네임
          <input maxLength={20} minLength={2} pattern="[가-힣A-Za-z0-9_]{2,20}" required value={nickname} onChange={(event) => setNickname(event.target.value)} />
        </label>
        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-success">{message}</p>}
        <button className="button" disabled={submitting} type="submit">{submitting ? "변경 중…" : "닉네임 변경"}</button>
      </form>
    </section>
  );
}
