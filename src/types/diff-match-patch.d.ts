declare module 'diff-match-patch' {
    export type Diff = [number, string];
    export type Patch = any;
  
    export default class DiffMatchPatch {
      constructor();
  
      diff_main(text1: string, text2: string, opt_checklines?: boolean): Diff[];
      
      diff_cleanupSemantic(diffs: Diff[]): void;
      
      diff_cleanupEfficiency(diffs: Diff[]): void;
      
      diff_levenshtein(diffs: Diff[]): number;
      
      diff_prettyHtml(diffs: Diff[]): string;
      
      match_main(text: string, pattern: string, loc: number): number;
      
      patch_make(
        a: string | Diff[],
        opt_b?: string | Diff[],
        opt_c?: string
      ): Patch[];
      
      patch_apply(patches: Patch[], text: string): [string, boolean[]];
      
      patch_toText(patches: Patch[]): string;
      
      patch_fromText(textline: string): Patch[];
      
      Diff_Timeout: number;
      Diff_EditCost: number;
      Match_Threshold: number;
      Match_Distance: number;
      Patch_DeleteThreshold: number;
      Patch_Margin: number;
      Match_MaxBits: number;
    }
  }