import { z } from "zod";

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const httpUrl = z
  .string()
  .trim()
  .refine((v) => {
    try {
      const u = new URL(v);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch {
      return false;
    }
  }, "URL inválida (use http:// ou https://)");

const optionalUrl = z.union([z.literal(""), httpUrl]);

export const sessaoInputSchema = z.object({
  id: z.string().max(64).optional(),
  titulo: z.string().trim().max(200).default(""),
  inicio: z.iso.datetime({ offset: true }),
  duracaoMin: z.coerce.number().int().min(5).max(24 * 60),
  linkAoVivo: optionalUrl.default(""),
  gravacaoUrl: optionalUrl.default(""),
});

export const turmaInputSchema = z.object({
  titulo: z.string().trim().min(1, "Título obrigatório").max(200),
  descricao: z.string().trim().max(10_000).default(""),
  publicada: z.boolean(),
  paper: z.object({
    titulo: z.string().trim().min(1, "Título do paper obrigatório").max(300),
    autores: z.string().trim().max(500).default(""),
    origem: z.enum(["externo", "proprio"]),
    url: httpUrl,
  }),
  sessoes: z.array(sessaoInputSchema).max(50),
});

export type TurmaInput = z.infer<typeof turmaInputSchema>;
export type SessaoInput = z.infer<typeof sessaoInputSchema>;
