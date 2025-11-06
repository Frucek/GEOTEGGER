from fastapi import Request, HTTPException
import jwt


# def verify_supabase_token(request: Request):
#     auth_header = request.headers.get("authorization")
#     if not auth_header:
#         raise HTTPException(status_code=401, detail="Missing authorization header")
#
#     token = auth_header.replace("Bearer ", "")
#     try:
#         decoded = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
#         return decoded
#     except jwt.PyJWTError:
#         raise HTTPException(status_code=401, detail="Invalid token")
