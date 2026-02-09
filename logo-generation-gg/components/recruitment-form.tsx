"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, ShieldX, AlertTriangle, Upload, X } from "lucide-react"
import { blacklistedIds } from "@/lib/blacklist"

export default function RecruitmentForm() {
  const router = useRouter()

  const [candidateName, setCandidateName] = useState("")
  const [recruiterName, setRecruiterName] = useState("")
  const [assistantRecruiterName, setAssistantRecruiterName] = useState("")
  const [passportId, setPassportId] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [isBlacklisted, setIsBlacklisted] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>("")
  const [acceptedTransferRules, setAcceptedTransferRules] = useState(false)

  const [criteria, setCriteria] = useState({
    modulacaoPerguntas: false,
    modulacaoExercicio: false,
    abordagemPerguntas: false,
    abordagemExercicio: false,
    acompanhamentoPerguntas: false,
    acompanhamentoExercicio: false,
    codigoQPerguntas: false,
    codigoQExercicio: false,
    leiMiranda: false,
    prevaricacao: false,
  })

  const [postRecruitment, setPostRecruitment] = useState({
    email: false,
    cargos: false,
    fardamento: false,
    informes: false,
    regras: false,
  })

  const handleVerifyPassport = async () => {
    if (!passportId.trim()) {
      setVerificationMessage("Por favor, insira um ID de passaporte.")
      setIsVerified(false)
      return
    }

    setIsVerifying(true)
    try {
      const blacklisted = blacklistedIds.includes(passportId.trim())

      setIsBlacklisted(blacklisted)
      setIsVerified(true)

      if (blacklisted) {
        setVerificationMessage("ESTA PESSOA ESTA NA BLACKLIST - NAO PODE SER RECRUTADA!")
      } else {
        setVerificationMessage("ESTA PESSOA NAO ESTA NA BLACKLIST")
      }
    } catch (error) {
      console.error("Erro ao verificar blacklist:", error)
      setVerificationMessage("Erro ao verificar blacklist. Tente novamente.")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleCriteriaChange = (key: keyof typeof criteria) => {
    setCriteria((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handlePostRecruitmentChange = (key: keyof typeof postRecruitment) => {
    setPostRecruitment((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview("")
  }

  const calculateApprovalStatus = () => {
    const questions = [
      criteria.modulacaoPerguntas,
      criteria.abordagemPerguntas,
      criteria.acompanhamentoPerguntas,
      criteria.codigoQPerguntas,
      criteria.leiMiranda,
      criteria.prevaricacao,
    ].filter(Boolean).length

    const exercises = [
      criteria.modulacaoExercicio,
      criteria.abordagemExercicio,
      criteria.acompanhamentoExercicio,
      criteria.codigoQExercicio,
    ].filter(Boolean).length

    const totalCompleted = questions + exercises

    const isApproved = questions >= 3 && exercises >= 2 && totalCompleted >= 5

    return {
      approved: isApproved,
      questionsCompleted: questions,
      exercisesCompleted: exercises,
      totalCompleted,
    }
  }

  const handleSubmitTAF = async () => {
    if (!candidateName || !passportId || !recruiterName) {
      alert("Por favor, preencha todos os dados do candidato")
      return
    }

    const status = calculateApprovalStatus()
    const tafData = {
      id: `taf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      candidateName,
      passportId,
      recruiterName,
      assistantRecruiterName: assistantRecruiterName || "N/A",
      date: new Date().toISOString(),
      photo: photoPreview,
      criteria: {
        "Perguntas sobre Modulacao (minimo 6)": criteria.modulacaoPerguntas,
        "Exercicio de modulacao": criteria.modulacaoExercicio,
        "Perguntas sobre Abordagem (minimo 6)": criteria.abordagemPerguntas,
        "Exercicio de abordagem": criteria.abordagemExercicio,
        "Perguntas sobre Acompanhamento (minimo 6)": criteria.acompanhamentoPerguntas,
        "Exercicio de Acompanhamento": criteria.acompanhamentoExercicio,
        "Perguntas sobre Codigo Q (minimo 6)": criteria.codigoQPerguntas,
        "Exercicio de modulacao eficiente com Codigo Q": criteria.codigoQExercicio,
        "Lei de Miranda": criteria.leiMiranda,
        "Prevaricacao e Corrupcao": criteria.prevaricacao,
      },
      postRecruitment: {
        "Setar no email corretamente": postRecruitment.email,
        "Setar os cargos dos cursos pos recrutamento": postRecruitment.cargos,
        "Instruir no fardamento correto": postRecruitment.fardamento,
        "Passar ultimos informes importantes": postRecruitment.informes,
        "Informar regras da cidade e da policia": postRecruitment.regras,
      },
      status: {
        questionsCorrect: status.questionsCompleted,
        exercisesCorrect: status.exercisesCompleted,
        totalCorrect: status.totalCompleted,
        totalCriteria: 10,
        approved: status.approved,
      },
      acceptedTransferRules,
    }

    try {
      const response = await fetch("/api/tafs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tafData),
      })

      if (response.ok) {
        if (status.approved) {
          router.push("/tafs")
        } else {
          router.push("/tafs-reprovados")
        }
      } else {
        throw new Error("Erro ao salvar TAF")
      }
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro ao salvar TAF. Tente novamente.")
    }
  }

  const status = calculateApprovalStatus()

  return (
    <div className="min-h-screen page-overlay py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-5">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#64a0e6]/10 rounded-full blur-2xl scale-150" />
              <img
                src="/images/police-oasis.png"
                alt="Policia Oasis"
                className="relative h-36 w-36 object-contain drop-shadow-2xl"
              />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-[#e2e8f0] tracking-tight">Processo de Recrutamento</h1>
            <p className="text-[#64748b] text-lg mt-2 tracking-wide">Policia Oasis - Servir e Proteger</p>
          </div>
        </div>

        {/* Candidate Info */}
        <Card className="card-modern border-[#2a2e3a]">
          <CardHeader>
            <CardTitle className="text-[#c8d0dc]">Informacoes do Candidato e Recrutador</CardTitle>
            <CardDescription className="text-[#5a6478]">Preencha os dados basicos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="candidate" className="text-[#8a94a6]">Nome do Candidato</Label>
                <Input
                  id="candidate"
                  placeholder="Digite o nome completo"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="bg-[#161a22] border-[#2a2e3a] text-[#e2e8f0] placeholder:text-[#4a5060] focus:border-[#64a0e6]/50 focus:ring-[#64a0e6]/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recruiter" className="text-[#8a94a6]">Nome do Recrutador (Ex: Lua - 3030)</Label>
                <Input
                  id="recruiter"
                  placeholder="Digite o nome do recrutador"
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                  className="bg-[#161a22] border-[#2a2e3a] text-[#e2e8f0] placeholder:text-[#4a5060] focus:border-[#64a0e6]/50 focus:ring-[#64a0e6]/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assistant" className="text-[#8a94a6]">Auxiliar de Recrutamento - Opcional (Ex: Marcus - 2020)</Label>
                <Input
                  id="assistant"
                  placeholder="Digite o nome do auxiliar"
                  value={assistantRecruiterName}
                  onChange={(e) => setAssistantRecruiterName(e.target.value)}
                  className="bg-[#161a22] border-[#2a2e3a] text-[#e2e8f0] placeholder:text-[#4a5060] focus:border-[#64a0e6]/50 focus:ring-[#64a0e6]/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo" className="text-[#8a94a6]">Foto do Conscrito (Opcional)</Label>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview || "/placeholder.svg"}
                      alt="Preview da foto"
                      className="w-24 h-24 object-cover rounded-xl border-2 border-[#3a4050]"
                    />
                    <button
                      onClick={handleRemovePhoto}
                      className="absolute -top-2 -right-2 bg-red-500 text-[#fafafa] rounded-full p-1 hover:bg-red-600 transition-colors"
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 border-2 border-dashed border-[#2a2e3a] rounded-xl flex items-center justify-center bg-[#161a22]">
                    <Upload className="h-8 w-8 text-[#4a5060]" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="bg-[#161a22] border-[#2a2e3a] text-[#e2e8f0]"
                  />
                  <p className="text-xs text-[#5a6478] mt-1">
                    Envie uma foto do conscrito para incluir na ficha de recrutamento
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blacklist Verification */}
        <Card className="card-modern border-[#2a2e3a]">
          <CardHeader>
            <CardTitle className="text-[#c8d0dc]">Verificacao de Blacklist</CardTitle>
            <CardDescription className="text-[#5a6478]">Digite o ID do passaporte para verificar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite o ID do passaporte"
                value={passportId}
                onChange={(e) => {
                  setPassportId(e.target.value)
                  setIsVerified(false)
                }}
                className="bg-[#161a22] border-[#2a2e3a] text-[#e2e8f0] placeholder:text-[#4a5060] focus:border-[#64a0e6]/50 focus:ring-[#64a0e6]/20"
              />
              <Button
                onClick={handleVerifyPassport}
                className="bg-[#2a3040] text-[#c8d0dc] hover:bg-[#343a4c] border border-[#3a4050]"
                disabled={isVerifying}
              >
                {isVerifying ? "Verificando..." : "Verificar"}
              </Button>
            </div>

            {isVerified && (
              <Alert
                className={
                  isBlacklisted
                    ? "border-2 border-red-500/60 bg-red-950/30"
                    : "border-2 border-emerald-500/60 bg-emerald-950/20"
                }
              >
                <div className="flex items-center gap-3">
                  {isBlacklisted ? (
                    <ShieldX className="h-6 w-6 text-red-500" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  )}
                  <AlertDescription
                    className={isBlacklisted ? "text-red-400 font-bold text-lg" : "text-emerald-400 font-bold text-lg"}
                  >
                    {verificationMessage}
                  </AlertDescription>
                </div>
                {isBlacklisted && (
                  <p className="text-red-400/80 text-sm mt-2 ml-9">
                    Esta pessoa nao pode ser recrutada. Consulte outro candidato.
                  </p>
                )}
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Evaluation Criteria */}
        <Card className="card-modern border-[#2a2e3a]">
          <CardHeader>
            <CardTitle className="text-[#c8d0dc]">Criterios de Avaliacao</CardTitle>
            <CardDescription className="text-[#5a6478]">Marque os criterios que o candidato completou</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { id: "modulacaoPerguntas", label: "Perguntas sobre Modulacao, no minimo 6" },
                { id: "modulacaoExercicio", label: "Realizar um exercicio de modulacao" },
                { id: "abordagemPerguntas", label: "Perguntas sobre Abordagem, no minimo 6" },
                { id: "abordagemExercicio", label: "Realizar um exercicio de abordagem" },
                { id: "acompanhamentoPerguntas", label: "Perguntas sobre Acompanhamento, no minimo 6" },
                { id: "acompanhamentoExercicio", label: "Realizar um exercicio de Acompanhamento" },
                { id: "codigoQPerguntas", label: "Perguntas sobre Codigo Q, no minimo 6" },
                { id: "codigoQExercicio", label: "Realizar um exercicio de modulacao eficiente com Codigo Q" },
                { id: "leiMiranda", label: "Perguntar a Lei de Miranda" },
                { id: "prevaricacao", label: "Perguntar o conhecimento sobre Prevaricacao e Corrupcao" },
              ].map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#1a1e28] transition-colors">
                  <Checkbox
                    id={item.id}
                    checked={criteria[item.id as keyof typeof criteria]}
                    onCheckedChange={() => handleCriteriaChange(item.id as keyof typeof criteria)}
                  />
                  <Label htmlFor={item.id} className="text-sm cursor-pointer text-[#a0aab8]">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>

            {/* Real-time Status */}
            <div className={`p-4 rounded-xl border ${status.approved ? "border-emerald-500/30 bg-emerald-950/15" : "border-[#3a4050] bg-[#161a22]"}`}>
              <div className="flex items-center gap-3">
                <AlertTriangle className={`h-5 w-5 ${status.approved ? "text-emerald-500" : "text-[#64748b]"}`} />
                <p className="text-sm text-[#a0aab8]">
                  <strong className="text-[#c8d0dc]">Status atual:</strong> {status.questionsCompleted} perguntas, {status.exercisesCompleted}{" "}
                  exercicios ({status.totalCompleted}/10 total)
                  {status.approved ? (
                    <span className="text-emerald-400 font-semibold"> - APROVADO</span>
                  ) : (
                    <span className="text-[#f59e0b] font-semibold"> - REPROVADO</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transfer Rules */}
        <Card className="card-modern border-[#2a2e3a]">
          <CardHeader>
            <CardTitle className="text-[#c8d0dc]">Regras de Desligamento/Transferencia</CardTitle>
            <CardDescription className="text-[#5a6478]">O candidato deve aceitar estas condicoes antes de prosseguir</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-[#161a22] border border-[#2a2e3a] rounded-xl p-5 space-y-3">
              {[
                { title: "Permanencia minima:", text: "O candidato deve permanecer no minimo 15 dias na unidade atual." },
                { title: "Advertencias:", text: "Nao pode possuir advertencias ativas para solicitar transferencia." },
                { title: "Patente minima:", text: "Apenas membros com patente de Soldado+ podem solicitar transferencia." },
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-[#64a0e6] rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-[#a0aab8]">
                    <strong className="text-[#c8d0dc]">{rule.title}</strong> {rule.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-start space-x-3 p-4 bg-[#1a1e28] border border-[#2a2e3a] rounded-xl">
              <Checkbox
                id="acceptTransferRules"
                checked={acceptedTransferRules}
                onCheckedChange={(checked) => setAcceptedTransferRules(checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="acceptTransferRules" className="cursor-pointer leading-relaxed text-[#a0aab8]">
                <strong className="text-[#c8d0dc]">Confirmo que o candidato aceita as condicoes acima.</strong> Antes de prosseguir, confirme se o
                candidato leu e aceita essas condicoes. So apos a confirmacao o processo continuara.
              </Label>
            </div>

            {acceptedTransferRules && (
              <Alert className="border-emerald-500/30 bg-emerald-950/15">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <AlertDescription className="text-emerald-400">
                  Candidato confirmou aceite das Regras de Desligamento/Transferencia
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Approval Rules */}
        <Card className="card-modern border-[#2a2e3a]">
          <CardHeader>
            <CardTitle className="text-[#c8d0dc]">Regras de Aprovacao</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#8a94a6]">
              <div className="space-y-3 border-l-2 border-[#64a0e6]/30 pl-4">
                <p>
                  Dentre os 10 topicos acima, se o conscrito respondeu corretamente 5 topicos, sendo 3 de perguntas e 2
                  exercicios, o mesmo pode entrar no departamento contando que assim que entrar tera de passar por um
                  curso do topico na qual ele nao soube complementar.
                </p>
                <p>Caso ele acerte apenas 1-4 topico(s), ele nao pode entrar de forma alguma no departamento.</p>
              </div>
              <div className="space-y-3 border-l-2 border-[#64a0e6]/30 pl-4">
                <p>A aplicacao do TAF (teste de aptidao fisica) fica a criterio do recrutador.</p>
                <p>
                  Caso o conscrito que passou no recrutamento, algum dia venha a faltar com algum dos topicos, ele
                  perdera a dependencia na qual ele cometeu o erro e tera que refazer um curso desde mesmo modulo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Post-Recruitment */}
        <Card className="card-modern border-[#2a2e3a]">
          <CardHeader>
            <CardTitle className="text-[#c8d0dc]">Pos-Recrutamento: Como Prosseguir</CardTitle>
            <CardDescription className="text-[#5a6478]">Marque as acoes realizadas apos o recrutamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { id: "email", label: "Setar no email corretamente" },
              { id: "cargos", label: "Setar os cargos dos cursos pos recrutamento conforme foi feito o relatorio do recrutamento" },
              { id: "fardamento", label: "Instruir no fardamento correto" },
              { id: "informes", label: "Passar ultimos informes importantes enviados em Avisos Gerais" },
              { id: "regras", label: "Informar o que deve e o que nao deve realizar dentro da cidade, instruindo a ler as regras tanto da cidade quanto da policia" },
            ].map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#1a1e28] transition-colors">
                <Checkbox
                  id={item.id}
                  checked={postRecruitment[item.id as keyof typeof postRecruitment]}
                  onCheckedChange={() => handlePostRecruitmentChange(item.id as keyof typeof postRecruitment)}
                />
                <Label htmlFor={item.id} className="text-sm cursor-pointer text-[#a0aab8]">
                  {item.label}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button
          onClick={handleSubmitTAF}
          size="lg"
          className="w-full bg-[#2a3040] hover:bg-[#343a4c] text-[#e2e8f0] text-lg py-6 border border-[#3a4050] transition-all hover:border-[#64a0e6]/30"
          disabled={isBlacklisted || !acceptedTransferRules}
        >
          <CheckCircle2 className="mr-2 h-5 w-5" />
          TAF Realizado
        </Button>

        {!acceptedTransferRules && !isBlacklisted && (
          <Alert className="border-[#f59e0b]/30 bg-[#f59e0b]/5">
            <AlertTriangle className="h-5 w-5 text-[#f59e0b]" />
            <AlertDescription className="text-[#f59e0b]/80">
              O candidato precisa aceitar as Regras de Desligamento/Transferencia antes de realizar o TAF.
            </AlertDescription>
          </Alert>
        )}

        {isBlacklisted && (
          <Alert className="border-2 border-red-500/50 bg-red-950/20">
            <ShieldX className="h-5 w-5 text-red-500" />
            <AlertDescription className="text-red-400">
              Nao e possivel realizar o TAF. O candidato esta na BLACKLIST.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
