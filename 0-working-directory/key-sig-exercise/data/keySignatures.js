// data/keySignatures.js

/**
 * 調号データ一覧
 * meiValue: Verovio に渡すキーシグネチャ値
 * 各言語の長調・短調の名称を保持
 */
export const keySignatures = [
  { meiValue: "0s", nameMajorJp: "ハ長調",   nameMajorEn: "C Major",  nameMajorDe: "C-Dur", nameMinorJp: "イ短調",   nameMinorEn: "A Minor",  nameMinorDe: "a-Moll" },
  { meiValue: "1s", nameMajorJp: "ト長調",   nameMajorEn: "G Major",  nameMajorDe: "G-Dur", nameMinorJp: "ホ短調",   nameMinorEn: "E Minor",  nameMinorDe: "e-Moll" },
  { meiValue: "2s", nameMajorJp: "ニ長調",   nameMajorEn: "D Major",  nameMajorDe: "D-Dur", nameMinorJp: "ロ短調",   nameMinorEn: "B Minor",  nameMinorDe: "h-Moll" },
  { meiValue: "3s", nameMajorJp: "イ長調",   nameMajorEn: "A Major",  nameMajorDe: "A-Dur", nameMinorJp: "嬰ヘ短調", nameMinorEn: "F# Minor", nameMinorDe: "fis-Moll" },
  { meiValue: "4s", nameMajorJp: "ホ長調",   nameMajorEn: "E Major",  nameMajorDe: "E-Dur", nameMinorJp: "嬰ハ短調", nameMinorEn: "C# Minor", nameMinorDe: "cis-Moll" },
  { meiValue: "5s", nameMajorJp: "ロ長調",   nameMajorEn: "B Major",  nameMajorDe: "H-Dur", nameMinorJp: "嬰ト短調", nameMinorEn: "G# Minor", nameMinorDe: "gis-Moll" },
  { meiValue: "6s", nameMajorJp: "嬰ヘ長調", nameMajorEn: "F# Major", nameMajorDe: "Fis-Dur", nameMinorJp: "嬰ニ短調", nameMinorEn: "D# Minor", nameMinorDe: "dis-Moll" },
  { meiValue: "7s", nameMajorJp: "嬰ハ長調", nameMajorEn: "C# Major", nameMajorDe: "Cis-Dur", nameMinorJp: "嬰イ短調", nameMinorEn: "A# Minor", nameMinorDe: "ais-Moll" },
  { meiValue: "1f", nameMajorJp: "ヘ長調",   nameMajorEn: "F Major",  nameMajorDe: "F-Dur", nameMinorJp: "ニ短調",   nameMinorEn: "D Minor",   nameMinorDe: "d-Moll" },
  { meiValue: "2f", nameMajorJp: "変ロ長調", nameMajorEn: "Bb Major", nameMajorDe: "B-Dur", nameMinorJp: "ト短調",   nameMinorEn: "G Minor",   nameMinorDe: "g-Moll" },
  { meiValue: "3f", nameMajorJp: "変ホ長調", nameMajorEn: "Eb Major", nameMajorDe: "Es-Dur", nameMinorJp: "ハ短調",   nameMinorEn: "C Minor",   nameMinorDe: "c-Moll" },
  { meiValue: "4f", nameMajorJp: "変イ長調", nameMajorEn: "Ab Major", nameMajorDe: "As-Dur", nameMinorJp: "ヘ短調",   nameMinorEn: "F Minor",   nameMinorDe: "f-Moll" },
  { meiValue: "5f", nameMajorJp: "変ニ長調", nameMajorEn: "Db Major", nameMajorDe: "Des-Dur", nameMinorJp: "変ロ短調", nameMinorEn: "Bb Minor", nameMinorDe: "b-Moll" },
  { meiValue: "6f", nameMajorJp: "変ト長調", nameMajorEn: "Gb Major", nameMajorDe: "Ges-Dur", nameMinorJp: "変ホ短調", nameMinorEn: "Eb Minor", nameMinorDe: "es-Moll" },
  { meiValue: "7f", nameMajorJp: "変ハ長調", nameMajorEn: "Cb Major", nameMajorDe: "Ces-Dur", nameMinorJp: "変イ短調", nameMinorEn: "Ab Minor", nameMinorDe: "as-Moll" }
];

/**
 * Verovio に渡す MEI のベーステンプレート。
 * ##KEY_SIG## を実際の meiValue に置き換えて利用します。
 */
export const baseMeiTemplate = `
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="5.1">
  <meiHead>
    <fileDesc>
      <titleStmt><title></title></titleStmt>
      <pubStmt/>
    </fileDesc>
  </meiHead>
  <music>
    <body>
      <mdiv>
        <score>
          <scoreDef keysig="##KEY_SIG##">
            <staffGrp>
              <staffDef n="1" clef.shape="G" clef.line="2" lines="5"/>
            </staffGrp>
          </scoreDef>
          <section>
            <measure n="1">
              <staff n="1">
                <layer n="1"/>
              </staff>
            </measure>
          </section>
        </score>
      </mdiv>
    </body>
  </music>
</mei>`;
