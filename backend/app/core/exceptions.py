from fastapi import HTTPException, status


class AppException(HTTPException):
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)


class NotFoundException(AppException):
    def __init__(self, resource: str = "Resource"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=f"{resource} not found")


class ForbiddenException(AppException):
    def __init__(self, detail: str = "Not authorized"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class ConflictException(AppException):
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class ValidationException(AppException):
    def __init__(self, detail: str = "Invalid input"):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)
