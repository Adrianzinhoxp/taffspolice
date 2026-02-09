"use client"

import type React from "react"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, XCircle, ArrowLeft, Search, FileText } from "lucide-react"
import Link from "next/link"
import { generateTAFPDF } from "@/lib/pdf-generator"

interface TAF {
  id: string
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

const ITEMS_PER_PAGE = 9

export default function TAFsReprovadosPage() {
  const [tafs, setTafs] = useState<TAF[]>([])
  const [selectedTaf, setSelectedTaf] = useState<TAF | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadTafs = async () => {
      try {
        const response = await fetch("/api/tafs")
        const data = await response.json()
        const rejectedTafs = data.tafs.filter((taf: TAF) => !taf.status.approved)
        setTafs(rejectedTafs)
      } catch (error) {
        console.error("Erro ao carregar TAFs:", error)
      }
    }

    loadTafs()
    const interval = setInterval(loadTafs, 5000)
    return () => clearInterval(interval)
  }, [])

  const filteredTafs = useMemo(() => {
    return tafs.filter((taf) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        taf.candidateName.toLowerCase().includes(searchLower) ||
        taf.passportId.toLowerCase().includes(searchLower) ||
        taf.recruiterName.toLowerCase().includes(searchLower) ||
        (taf.assistantRecruiterName && taf.assistantRecruiterName.toLowerCase().includes(searchLower))
      )
    })
  }, [tafs, searchTerm])

  const totalPages = Math.ceil(filteredTafs.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentTafs = filteredTafs.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const renderPaginationButtons = () => {
    const buttons = []
    const maxVisibleButtons = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2))
    const endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1)

    if (endPage - startPage < maxVisibleButtons - 1) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1)
    }

    if (currentPage > 1) {
      buttons.push(
        <Button
          key="prev"
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage - 1)}
          className="border-[#2a2e3a] bg-transparent text-[#8a94a6] hover:bg-[#1e2230] hover:text-[#c8d0dc]"
        >
          Anterior
        </Button>,
      )
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(i)}
          className={currentPage === i ? "bg-[#2a3040] text-[#e2e8f0] border-[#3a4050]" : "border-[#2a2e3a] bg-transparent text-[#8a94a6] hover:bg-[#1e2230]"}
        >
          {i}
        </Button>,
      )
    }

    if (currentPage < totalPages) {
      buttons.push(
        <Button
          key="next"
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage + 1)}
          className="border-[#2a2e3a] bg-transparent text-[#8a94a6] hover:bg-[#1e2230] hover:text-[#c8d0dc]"
        >
          Proximo
        </Button>,
      )
    }

    return buttons
  }

  const handleGeneratePDF = (taf: TAF, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    generateTAFPDF(taf)
  }

  return (
    <div className="min-h-screen page-overlay">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-red-400 mb-2">TAFs Reprovados</h1>
            <p className="text-[#5a6478]">Historico de candidatos que nao foram aprovados</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-[#2a2e3a] bg-transparent text-[#8a94a6] hover:bg-[#1e2230] hover:text-[#c8d0dc]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Formulario
            </Button>
          </Link>
        </div>

        {tafs.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5a6478]" />
              <Input
                type="text"
                placeholder="Pesquisar por nome, ID ou recrutador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#2a2e3a] bg-[#161a22] text-[#e2e8f0] placeholder:text-[#4a5060] focus:border-[#64a0e6]/50"
              />
            </div>
          </div>
        )}

        {tafs.length === 0 ? (
          <Card className="border-[#2a2e3a] card-modern">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-[#5a6478] text-lg">Nenhum TAF reprovado ainda</p>
              <Link href="/">
                <Button className="mt-4 bg-[#2a3040] hover:bg-[#343a4c] text-[#e2e8f0] border border-[#3a4050]">Realizar Primeiro TAF</Button>
              </Link>
            </CardContent>
          </Card>
        ) : filteredTafs.length === 0 ? (
          <Card className="border-[#2a2e3a] card-modern">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-[#5a6478] text-lg">Nenhum resultado encontrado</p>
              <Button onClick={() => setSearchTerm("")} variant="outline" className="mt-4 bg-transparent border-[#2a2e3a] text-[#8a94a6]">
                Limpar pesquisa
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentTafs.map((taf) => (
                <Card
                  key={taf.id}
                  className="border-[#2a2e3a] hover:border-red-500/25 transition-all cursor-pointer card-modern"
                  onClick={() => setSelectedTaf(taf)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-[#e2e8f0] mb-1">{taf.candidateName}</CardTitle>
                        <p className="text-sm text-[#5a6478]">ID: {taf.passportId}</p>
                      </div>
                      {taf.photo && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-red-500/20">
                          <img
                            src={taf.photo || "/placeholder.svg"}
                            alt={taf.candidateName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/15">
                      <span className="text-sm font-medium text-[#8a94a6]">Status:</span>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="font-bold text-red-400">REPROVADO</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#5a6478]">Perguntas:</span>
                        <span className="font-medium text-[#c8d0dc]">{taf.status.questionsCorrect}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5a6478]">Exercicios:</span>
                        <span className="font-medium text-[#c8d0dc]">{taf.status.exercisesCorrect}/5</span>
                      </div>
                      <div className="flex justify-between border-t border-[#2a2e3a] pt-2">
                        <span className="text-[#5a6478]">Total:</span>
                        <span className="font-bold text-red-400">
                          {taf.status.totalCorrect}/{taf.status.totalCriteria}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#2a2e3a] space-y-1 text-xs">
                      <div className="flex justify-between text-[#5a6478]">
                        <span>Recrutador:</span>
                        <span className="font-medium text-[#8a94a6]">{taf.recruiterName}</span>
                      </div>
                      {taf.assistantRecruiterName && taf.assistantRecruiterName !== "N/A" && (
                        <div className="flex justify-between text-[#5a6478]">
                          <span>Auxiliar:</span>
                          <span className="font-medium text-[#8a94a6]">{taf.assistantRecruiterName}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[#5a6478]">
                        <span>Data:</span>
                        <span className="font-medium text-[#8a94a6]">{taf.date}</span>
                      </div>
                    </div>

                    <Button
                      onClick={(e) => handleGeneratePDF(taf, e)}
                      className="w-full bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20"
                      size="sm"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Gerar PDF
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">{renderPaginationButtons()}</div>
            )}
          </>
        )}
      </div>

      <Dialog open={!!selectedTaf} onOpenChange={() => setSelectedTaf(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#161a22] border-[#2a2e3a]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-red-400">Detalhes do TAF - Reprovado</DialogTitle>
          </DialogHeader>

          {selectedTaf && (
            <div className="space-y-6">
              <div className="flex gap-6 items-start">
                {selectedTaf.photo && (
                  <div className="w-48 h-48 rounded-xl overflow-hidden border-2 border-red-500/20 flex-shrink-0">
                    <img
                      src={selectedTaf.photo || "/placeholder.svg"}
                      alt={selectedTaf.candidateName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-2xl font-bold text-[#e2e8f0]">{selectedTaf.candidateName}</h3>
                    <p className="text-[#5a6478]">Passaporte ID: {selectedTaf.passportId}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-[#5a6478]">Recrutador:</span>
                      <p className="font-medium text-[#c8d0dc]">{selectedTaf.recruiterName}</p>
                    </div>
                    {selectedTaf.assistantRecruiterName && selectedTaf.assistantRecruiterName !== "N/A" && (
                      <div>
                        <span className="text-[#5a6478]">Auxiliar:</span>
                        <p className="font-medium text-[#c8d0dc]">{selectedTaf.assistantRecruiterName}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-[#5a6478]">Data:</span>
                      <p className="font-medium text-[#c8d0dc]">{selectedTaf.date}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/15">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#8a94a6]">Status:</span>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-6 w-6 text-red-500" />
                        <span className="font-bold text-lg text-red-400">REPROVADO</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#12141a] border border-[#2a2e3a] text-center">
                  <p className="text-[#5a6478] text-sm mb-1">Perguntas</p>
                  <p className="text-2xl font-bold text-[#c8d0dc]">{selectedTaf.status.questionsCorrect}/5</p>
                </div>
                <div className="p-4 rounded-xl bg-[#12141a] border border-[#2a2e3a] text-center">
                  <p className="text-[#5a6478] text-sm mb-1">Exercicios</p>
                  <p className="text-2xl font-bold text-[#c8d0dc]">{selectedTaf.status.exercisesCorrect}/5</p>
                </div>
                <div className="p-4 rounded-xl bg-[#12141a] border border-red-500/15 text-center">
                  <p className="text-[#5a6478] text-sm mb-1">Total</p>
                  <p className="text-2xl font-bold text-red-400">
                    {selectedTaf.status.totalCorrect}/{selectedTaf.status.totalCriteria}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-[#c8d0dc] mb-3">Criterios de Avaliacao</h4>
                <div className="space-y-2">
                  {Object.entries(selectedTaf.criteria).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-[#12141a] border border-[#1e2230]">
                      <span className="text-[#8a94a6] text-sm">{key}</span>
                      {value ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-[#c8d0dc] mb-3">Pos-Recrutamento</h4>
                <div className="space-y-2">
                  {Object.entries(selectedTaf.postRecruitment).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-[#12141a] border border-[#1e2230]">
                      <span className="text-[#8a94a6] text-sm">{key}</span>
                      {value ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => handleGeneratePDF(selectedTaf)}
                className="w-full bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20"
              >
                <FileText className="mr-2 h-5 w-5" />
                Gerar PDF desta Ficha
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
