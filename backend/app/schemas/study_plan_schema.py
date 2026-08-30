from pydantic import BaseModel


class GenerateStudyPlanRequest(BaseModel):

    exam_id: int