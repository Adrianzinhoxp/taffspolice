import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

function getSQL() {
  const url = process.env.DATABASE_URL
  if (!url) {
    return null
  }
  // Remove channel_binding param if present as it can cause issues in serverless
  const cleanUrl = url.replace(/[&?]channel_binding=[^&]*/g, '')
  return neon(cleanUrl)
}

export async function GET() {
  try {
    const sql = getSQL()
    if (!sql) {
      return NextResponse.json(
        { message: "Database not configured", tafs: [] },
        { status: 200 },
      )
    }

    const rows = await sql`
      SELECT
        id,
        candidate_name,
        passport_id,
        recruiter_name,
        auxiliary_name,
        photo_url,
        date,
        status,
        criteria,
        created_at
      FROM tafs
      ORDER BY created_at DESC
    `

    const tafs = rows.map((r: any) => ({
      id: String(r.id),
      candidateName: r.candidate_name,
      passportId: r.passport_id,
      recruiterName: r.recruiter_name,
      assistantRecruiterName: r.auxiliary_name ?? "N/A",
      date: new Date(r.date).toLocaleDateString("pt-BR"),
      photo: r.photo_url ?? null,
      criteria: r.criteria ?? {},
      postRecruitment: {},
      status: r.status,
      createdAt: r.created_at,
    }))

    return NextResponse.json({ tafs }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar TAFs:", error)
    return NextResponse.json(
      { message: "Erro ao buscar TAFs", error: String(error), tafs: [] },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getSQL()
    if (!sql) {
      return NextResponse.json(
        { message: "Database not configured" },
        { status: 503 },
      )
    }

    const body = await request.json()

    const {
      candidateName,
      passportId,
      recruiterName,
      assistantRecruiterName,
      date,
      photo,
      criteria,
      status,
    } = body

    if (
      !candidateName ||
      !passportId ||
      !recruiterName ||
      !date ||
      !criteria ||
      !status ||
      status.questionsCorrect === undefined ||
      status.exercisesCorrect === undefined ||
      status.totalCriteria === undefined
    ) {
      return NextResponse.json(
        { message: "Campos obrigatórios faltando" },
        { status: 400 },
      )
    }

    const totalCorrect =
      status.totalCorrect ??
      Number(status.questionsCorrect) + Number(status.exercisesCorrect)

    const statusJson = JSON.stringify({ ...status, totalCorrect })
    const criteriaJson = JSON.stringify(criteria)

    const inserted = await sql`
      INSERT INTO tafs (
        candidate_name,
        passport_id,
        recruiter_name,
        auxiliary_name,
        photo_url,
        date,
        status,
        correct_questions,
        correct_exercises,
        total_criteria,
        criteria
      ) VALUES (
        ${candidateName},
        ${passportId},
        ${recruiterName},
        ${assistantRecruiterName || null},
        ${photo || null},
        ${new Date(date)},
        CAST(${statusJson} AS jsonb),
        ${Number(status.questionsCorrect)},
        ${Number(status.exercisesCorrect)},
        ${Number(status.totalCriteria)},
        CAST(${criteriaJson} AS jsonb)
      )
      RETURNING id
    `

    return NextResponse.json(
      { message: "TAF salvo com sucesso", id: String(inserted[0].id) },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erro ao salvar TAF:", error)
    return NextResponse.json(
      { message: "Erro ao salvar TAF", error: String(error) },
      { status: 500 },
    )
  }
}
