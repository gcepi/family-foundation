import { EscapementMark, PlumbMark, RoseMark, SealMark } from '~/illustrations'

/** One engraved mark per section of the document. */
export const SECTION_MARKS = {
  portrait: PlumbMark,
  practices: EscapementMark,
  constitution: RoseMark,
  covenant: SealMark,
}
