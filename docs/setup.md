# BuildLog 개발 환경 기준

## 1. 문서 목적

이 문서는 Phase 0에서 확인하고 확정한 개발 환경과 설정 기준을 기록합니다.

Phase 0에서는 로컬 환경을 읽기 전용으로 확인했습니다. 패키지 설치, 코드 생성, 데이터베이스 생성, Git 초기화는 하지 않았습니다.

확인 날짜는 2026년 10월 26일이며, 사용자에게 표시하는 날짜와 시간은 한국 표준시(`Asia/Seoul`)를 기준으로 합니다.

## 2. 로컬 환경 확인 결과

| 항목 | 확인 결과 | 판단 |
| --- | --- | --- |
| Python | 3.13.14, 3.12 설치됨 | 3.13.14 사용 |
| Node.js | 24.22.1 | 사용 가능 |
| npm | 11.19.1 | 사용 가능 |
| SQLite3 | Python 내장 3.50.4 | 개발·테스트에 사용 가능 |
| 백엔드 포트 | `127.0.0.1:8000` 사용 가능 | 기본값으로 사용 |
| 프론트엔드 포트 | `127.0.0.1:5173` 사용 가능 | 기본값으로 사용 |
| Git | 초기화되지 않음 | 사용자 요청 전까지 초기화하지 않음 |

PowerShell 실행 정책 때문에 `npm`을 직접 입력하면 `npm.ps1` 실행이 막힐 수 있습니다. 시스템 설정을 바꾸지 않고 `npm.cmd`와 `npx.cmd`를 사용합니다.

## 3. 확정한 기술 기준

### 백엔드

| 항목 | 기준 버전 |
| --- | --- |
| Python | 3.13.14 |
| FastAPI | 0.162.0 |
| Uvicorn | 0.54.0 |
| Pydantic | 2.14.1 |
| HTTP 테스트 도구 | httpx2 2.16.0 |

Python 3.13.14는 현재 컴퓨터에 설치되어 있고, 선택한 백엔드 패키지가 요구하는 Python 버전을 만족합니다.

### 프론트엔드

| 항목 | 기준 버전 |
| --- | --- |
| React | 19.3.1 |
| React DOM | 19.3.1 |
| TypeScript | 7.0.2 |
| Vite | 8.3.5 |
| Vite React 플러그인 | 6.1.2 |

React 프로젝트는 Vite의 React TypeScript 구성을 사용합니다. 설치 시점의 잠금 파일에 실제 설치 버전을 기록하고, Phase 도중 임의로 버전을 올리지 않습니다.

### 데이터베이스

| 항목 | 기준 버전 또는 방식 |
| --- | --- |
| SQLite3 데이터 접근 | SQLAlchemy 2.1.6 |
| 데이터 구조 변경 관리 | Alembic 1.20.1 |
| 개발·테스트 연결 | Python 내장 SQLite3 |

- 현재 MVP는 프로젝트 내부 SQLite3만 사용합니다.
- 실제 데이터 파일은 `database/buildlog.sqlite3`에 저장합니다.
- 자동 테스트는 실제 데이터와 분리된 임시 SQLite3에서 실행합니다.
- SQLAlchemy 모델과 Alembic으로 데이터 구조 변경을 관리합니다.
- Supabase 연결은 관련 수업을 진행한 뒤 별도로 검토합니다.

### 인증과 보안

| 항목 | 선택 |
| --- | --- |
| 비밀번호 처리 | `pwdlib`의 Argon2 방식 |
| 인증 정보 | PyJWT로 서명한 토큰 |
| 브라우저 보관 | JavaScript에서 읽을 수 없는 HttpOnly 쿠키 |
| 쿠키 기본 조건 | `SameSite=Lax`, 운영 환경에서 `Secure` 사용 |
| 프론트엔드 저장소 | 인증 토큰을 localStorage에 저장하지 않음 |

- 회원가입과 로그인은 FastAPI에서 처리합니다.
- 허용한 React 주소에서 오는 요청만 인증 쿠키를 포함할 수 있게 합니다.
- 비밀번호, 비밀키, 데이터베이스 연결 문자열을 로그에 남기지 않습니다.

## 4. 로컬 주소

| 역할 | 주소 |
| --- | --- |
| FastAPI | `http://127.0.0.1:8000` |
| React | `http://127.0.0.1:5173` |
| FastAPI 문서 | `http://127.0.0.1:8000/docs` |

FastAPI가 허용할 개발용 프론트엔드 주소는 `http://127.0.0.1:5173` 하나로 시작합니다.

## 5. 환경 변수 기준

Phase 1에서 다음 항목을 비밀값 없이 `.env.example`에 작성합니다.

| 이름 | 용도 | 개발 예시 |
| --- | --- | --- |
| `APP_ENV` | 실행 환경 구분 | `development` |
| `APP_SECRET_KEY` | 인증 정보 서명 | 실제 값은 `.env`에만 입력 |
| `DATABASE_URL` | 프로젝트 내부 SQLite3 연결 | `sqlite+pysqlite:///../database/buildlog.sqlite3` |
| `FRONTEND_ORIGIN` | FastAPI가 허용할 React 주소 | `http://127.0.0.1:5173` |
| `APP_TIMEZONE` | 사용자 기준 시간대 | `Asia/Seoul` |
| `COOKIE_SECURE` | HTTPS에서만 쿠키 전송 여부 | 로컬은 `false`, 운영은 `true` |
| `VITE_API_BASE_URL` | React가 호출할 FastAPI 주소 | `http://127.0.0.1:8000` |

`.env.example`에는 실제 비밀키나 비밀번호를 넣지 않습니다.

## 6. 날짜와 시간 처리

- 사용자에게 보이는 날짜와 시간은 모두 `Asia/Seoul` 기준입니다.
- 백엔드는 시간대 정보가 포함된 날짜와 시간을 사용합니다.
- 데이터베이스가 내부적으로 UTC로 정규화하더라도 FastAPI가 읽고 응답할 때 한국 표준시 기준을 적용합니다.
- 작성, 수정, 완료, 해결, 댓글, 신고 시간에 같은 규칙을 사용합니다.

## 7. 실행과 테스트 명령 기준

### 최초 설치

```powershell
python -m venv backend\.venv
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements-dev.txt
npm.cmd --prefix frontend install
```

Phase 1에서 아래 실행 명령을 확인했습니다.

### 백엔드

```powershell
Push-Location backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 프론트엔드

```powershell
Push-Location frontend
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

### 백엔드 테스트

```powershell
Push-Location backend
.\.venv\Scripts\python.exe -m pytest
```

### 프론트엔드 확인

```powershell
Push-Location frontend
npm.cmd run build
```

프론트엔드 자동 테스트 명령은 Phase 1에서 테스트 도구를 확정한 뒤 추가합니다.

## 8. SQLite3 준비

Phase 2에서 다음 명령으로 프로젝트 내부 데이터베이스를 준비했습니다.

```powershell
Push-Location backend
.\.venv\Scripts\python.exe -m alembic -c alembic.ini upgrade head
```

SQLite3 실제 파일은 Git에 저장하지 않습니다. 새 환경에서는 위 명령으로 빈 데이터베이스에 같은 구조를 다시 만들 수 있습니다.

## 9. Phase 0 완료 결과

- [x] TypeScript를 사용하기로 확정했습니다.
- [x] FastAPI와 React의 기준 버전을 확인했습니다.
- [x] Python, Node.js, npm, SQLite3 실행 환경을 확인했습니다.
- [x] SQLAlchemy와 Alembic으로 프로젝트 내부 SQLite3 구조를 관리하기로 했습니다.
- [x] FastAPI와 React의 로컬 주소를 정했습니다.
- [x] 인증 토큰과 쿠키의 기본 방식을 정했습니다.
- [x] 환경 변수 이름을 정했습니다.
- [x] 한국 표준시 사용을 확정했습니다.
- [x] 코드와 패키지를 변경하지 않았습니다.
- [x] 데이터베이스와 Git 저장소를 만들지 않았습니다.

Phase 0 완료 후 확정한 기준으로 Phase 1부터 Phase 3까지 진행했습니다.

## 10. 현재 진행 상태

- Phase 0: 개발 기준 확정 완료
- Phase 1: FastAPI·React 실행 뼈대 완료
- Phase 2: 프로젝트 내부 SQLite3와 사용자 구조 완료
- Phase 3: 회원가입, 자동 로그인, 로그인, 닉네임 변경 완료
- 다음 작업: Phase 4 공부 기록·할 일·오류 기록 데이터 구조

현재 SQLite3 마이그레이션은 `20261026_0001`이며 `users` 테이블을 만듭니다. 자동 테스트는 실제 `database/buildlog.sqlite3`와 분리된 임시 SQLite3를 사용합니다.

## 11. 확인에 사용한 공식 자료

- [Python 공식 다운로드와 지원 상태](https://www.python.org/downloads/)
- [FastAPI 공식 릴리스 노트](https://fastapi.tiangolo.com/release-notes/)
- [React 공식 버전 안내](https://react.dev/versions)
- [Vite 공식 안내](https://vite.dev/guide/)
- [SQLAlchemy 2.1 공식 문서](https://docs.sqlalchemy.org/en/21/)
- [FastAPI JWT 보안 안내](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/)
