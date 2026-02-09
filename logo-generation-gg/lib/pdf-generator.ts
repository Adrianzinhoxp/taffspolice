import jsPDF from "jspdf"

interface TAFData {
  candidateName: string
  passportId: string
  recruiterName: string
  assistantRecruiterName?: string
  date: string
  photo?: string
  criteria: Record<string, boolean>
  postRecruitment: Record<string, boolean>
  status: {
    questionsCorrect: number
    exercisesCorrect: number
    totalCorrect: number
    totalCriteria: number
    approved: boolean
  }
}

export const generateTAFPDF = (data: TAFData) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Colors matching the OASIS theme
  const primaryColor = [212, 175, 55] // Gold/Silver #d4af37
  const bgDark = [26, 31, 46] // Dark blue #1a1f2e
  const bgBox = [15, 20, 25] // Darker box #0f1419
  const textLight = [200, 200, 200] // Light gray #c8c8c8
  const white = [255, 255, 255]
  const green = [34, 197, 94]
  const red = [239, 68, 68]

  // Background
  doc.setFillColor(bgDark[0], bgDark[1], bgDark[2])
  doc.rect(0, 0, pageWidth, pageHeight, "F")

  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, pageWidth, 20, "F")
  doc.setTextColor(bgDark[0], bgDark[1], bgDark[2])
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("DEPARTAMENTO DE POLÍCIA OASIS", pageWidth / 2, 13, { align: "center" })

  // Subtitle
  doc.setFillColor(bgBox[0], bgBox[1], bgBox[2])
  doc.rect(10, 25, pageWidth - 20, 10, "F")
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.setFontSize(12)
  doc.text("FICHA DE TESTE DE APTIDÃO FÍSICA", pageWidth / 2, 31, { align: "center" })

  let yPos = 45

  // Candidate Data Section
  doc.setFillColor(bgBox[0], bgBox[1], bgBox[2])
  doc.rect(10, yPos, pageWidth - 20, 35, "F")

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("DADOS DO CANDIDATO", 15, yPos + 7)

  doc.setTextColor(textLight[0], textLight[1], textLight[2])
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Nome: ${data.candidateName}`, 15, yPos + 14)
  doc.text(`Passaporte ID: ${data.passportId}`, 15, yPos + 21)
  doc.text(`Data de Recrutamento: ${data.date}`, 15, yPos + 28)

  // Photo
  if (data.photo) {
    try {
      doc.addImage(data.photo, "JPEG", pageWidth - 40, yPos + 5, 25, 25)
    } catch (error) {
      console.error("Erro ao adicionar foto ao PDF:", error)
    }
  }

  yPos += 42

  // Recruiter Info
  doc.setFillColor(bgBox[0], bgBox[1], bgBox[2])
  doc.rect(10, yPos, pageWidth - 20, 20, "F")

  doc.setTextColor(textLight[0], textLight[1], textLight[2])
  doc.setFontSize(9)
  doc.text(`Recrutador Responsável: ${data.recruiterName}`, 15, yPos + 7)
  if (data.assistantRecruiterName && data.assistantRecruiterName !== "N/A") {
    doc.text(`Auxiliar de Recrutamento: ${data.assistantRecruiterName}`, 15, yPos + 14)
  }

  yPos += 27

  // Statistics
  const boxWidth = (pageWidth - 40) / 3
  doc.setFillColor(bgBox[0], bgBox[1], bgBox[2])
  doc.rect(10, yPos, boxWidth, 20, "F")
  doc.rect(10 + boxWidth + 5, yPos, boxWidth, 20, "F")
  doc.rect(10 + (boxWidth + 5) * 2, yPos, boxWidth, 20, "F")

  doc.setTextColor(textLight[0], textLight[1], textLight[2])
  doc.setFontSize(8)
  doc.text("Perguntas", 10 + boxWidth / 2, yPos + 6, { align: "center" })
  doc.text("Exercícios", 10 + boxWidth + 5 + boxWidth / 2, yPos + 6, { align: "center" })
  doc.text("Total", 10 + (boxWidth + 5) * 2 + boxWidth / 2, yPos + 6, { align: "center" })

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text(`${data.status.questionsCorrect}/5`, 10 + boxWidth / 2, yPos + 15, { align: "center" })
  doc.text(`${data.status.exercisesCorrect}/5`, 10 + boxWidth + 5 + boxWidth / 2, yPos + 15, { align: "center" })
  doc.text(
    `${data.status.totalCorrect}/${data.status.totalCriteria}`,
    10 + (boxWidth + 5) * 2 + boxWidth / 2,
    yPos + 15,
    { align: "center" },
  )

  yPos += 27

  // Status
  doc.setFillColor(
    data.status.approved ? green[0] : red[0],
    data.status.approved ? green[1] : red[1],
    data.status.approved ? green[2] : red[2],
  )
  doc.rect(10, yPos, pageWidth - 20, 15, "F")
  doc.setTextColor(white[0], white[1], white[2])
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text(data.status.approved ? "APROVADO" : "REPROVADO", pageWidth / 2, yPos + 10, { align: "center" })

  yPos += 22

  // Criteria Section
  doc.setFillColor(bgBox[0], bgBox[1], bgBox[2])
  const criteriaHeight = Object.keys(data.criteria).length * 7 + 12
  doc.rect(10, yPos, pageWidth - 20, criteriaHeight, "F")

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("CRITÉRIOS DE AVALIAÇÃO", 15, yPos + 7)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  let criteriaY = yPos + 14
  Object.entries(data.criteria).forEach(([key, value]) => {
    doc.setTextColor(textLight[0], textLight[1], textLight[2])
    doc.text(key, 15, criteriaY)
    doc.setTextColor(value ? green[0] : red[0], value ? green[1] : red[1], value ? green[2] : red[2])
    doc.text(value ? "✓" : "✗", pageWidth - 20, criteriaY)
    criteriaY += 7
  })

  yPos += criteriaHeight + 5

  // Post-Recruitment Section (if space available)
  if (yPos + 50 < pageHeight) {
    doc.setFillColor(bgBox[0], bgBox[1], bgBox[2])
    const postHeight = Object.keys(data.postRecruitment).length * 7 + 12
    doc.rect(10, yPos, pageWidth - 20, postHeight, "F")

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("PÓS-RECRUTAMENTO", 15, yPos + 7)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    let postY = yPos + 14
    Object.entries(data.postRecruitment).forEach(([key, value]) => {
      doc.setTextColor(textLight[0], textLight[1], textLight[2])
      doc.text(key, 15, postY)
      doc.setTextColor(value ? green[0] : red[0], value ? green[1] : red[1], value ? green[2] : red[2])
      doc.text(value ? "✓" : "✗", pageWidth - 20, postY)
      postY += 7
    })
  }

  // Footer
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.setFontSize(8)
  doc.text("Departamento de Polícia OASIS - Documento Oficial de Recrutamento", pageWidth / 2, pageHeight - 10, {
    align: "center",
  })
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, pageWidth / 2, pageHeight - 5, { align: "center" })

  // Generate filename from candidate name and ID
  const sanitizedName = data.candidateName.toLowerCase().replace(/\s+/g, "_")
  const filename = `ficha_${sanitizedName}_${data.passportId}.pdf`

  doc.save(filename)
}
