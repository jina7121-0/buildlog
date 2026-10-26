import { Link } from "react-router-dom";

import { useAuth } from "../components/AuthContext";

export default function HomePage() {
  const { user } = useAuth();
  return (
    <section className="card page-card">
      <p className="eyebrow">My BuildLog</p>
      <h1>{user?.nickname}님, 반가워요.</h1>
      <p className="description">
        회원 기능 준비가 끝났습니다. 다음 단계에서 공부 기록, 할 일, 오류 기록을 연결합니다.
      </p>
      <Link className="button button--secondary" to="/settings">계정 설정</Link>
    </section>
  );
}
