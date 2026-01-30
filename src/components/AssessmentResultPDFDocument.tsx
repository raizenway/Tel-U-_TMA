  import React from 'react';
  import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    Font,
  } from '@react-pdf/renderer';

  Font.register({
    family: 'OpenSans',
    fonts: [
      { src: '/fonts/OpenSans-Regular.ttf' },          // regular
      { src: '/fonts/OpenSans-Bold.ttf', fontWeight: 'bold' },
      { src: '/fonts/OpenSans-Italic.ttf', fontStyle: 'italic' },
      { src: '/fonts/OpenSans-BoldItalic.ttf', fontWeight: 'bold', fontStyle: 'italic' },
    ],
  });

  Font.register({
    family: 'BreeSerif',
    fonts: [
      { src: '/fonts/BreeSerif-Regular.ttf' },          // regular
    ],
  });

  /* ================= TYPES ================= */
  interface Assessment {
    name: string;
    email: string;
    address: string;
    studentBody: number;
    jumlahProdi: number;
    jumlahProdiUnggul: string;
    maturityLevelMinScore: number;
    maturityLevelMaxScore: number;
    maturityLevelName: string;
    maturityLevelDescription: string;
    periodeAssessment: string;
  }

  interface VariableReport {
    id: string;
    name: string;
    point: number;
    minScore: number;
    maxScore: number;
    maturityLevel: string;
    desc: string;
  }

  interface Props {
    assessments: Assessment[];
    variablesList: VariableReport[][];
    radarChartImages: (string | undefined)[];
  }

  /* ================= STYLES ================= */
  const styles = StyleSheet.create({
    page: {
      padding: '40 50',
      paddingBottom: 0,
      fontFamily: 'OpenSans',
      fontSize: 12,
      lineHeight: 1.6,
      color: '#000',
    },
    sidebar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 20,
    },
    title: {
      fontFamily: 'BreeSerif',
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      fontFamily: 'BreeSerif',
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 5,
    },
    period: {
      fontFamily: 'BreeSerif',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 5,
    },
    infoRow: {
      flexDirection: 'row',
      marginBottom: 6,
      infoRow: {
  flexDirection: 'row',
  marginBottom: 6,
  lineHeight: 1.3, // agar lebih rapat seperti di gambar
},
    },
    infoLabel: {
      width: '45%',
      fontWeight: 'normal',
    },
    infoValue: {
      width: '55%',
      paddingLeft: 5,
    },
    center: {
      textAlign: 'center',
    },
    bold: {
      fontWeight: 'bold',
    },
    redBox: {
      fontFamily: 'BreeSerif',
      backgroundColor: '#EC3237',
      color: '#ffffff',
      padding: '18 22',
      borderRadius: 6,
      border: '2px solid #e74c3c',
      marginBottom: 10,
    },
    redBoxTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
    },
    redBoxContent: {
      fontSize: 12,
      textAlign: 'justify',
    },
    chartFrame: {
      fontFamily: 'BreeSerif',
      border: '2px solid #EC3237',
      borderRadius: 6,
      padding: '15 20',
    },
    chartTitle: {
      fontSize: 18,
      color: '#EC3237',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#ED3237',
      borderWidth: 1,
      borderColor: '#DEAFB1',
    },
    tableHeaderCell: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 11,
      padding: 6,
      textAlign: 'center',
    },
    tableRow: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: '#ccc',
    },
    tableCell: {
      fontSize: 10,
      padding: 8,
    },
  });

  /* ================= DOCUMENT ================= */
  export const AssessmentResultPDFDocument = ({
    assessments,
    variablesList,
    radarChartImages,
  }: Props) => (
    <Document>
      {assessments.map((assessment, index) => (
        <React.Fragment key={index}>
        
      {/* PAGE 1: Data Umum - DESAIN SESUAI GAMBAR */}
<Page size="A4" style={styles.page}>
  <Image src="/bg_document_sidebar.png" style={styles.sidebar} />

  {/* Header Utama */}
  <Text style={[styles.title, { marginBottom: 20 }]}>
    TRANSFORMATION MATURITY ASSESSMENT
  </Text>
  <Text style={[styles.subtitle, { marginBottom: 5 }]}>
    Assessment Result
  </Text>

  {/* Periode Assessment */}
  <Text style={[styles.period, { marginBottom: 5 }]}>
    Periode Assessment: {assessment.periodeAssessment}
  </Text>

  {/* Logo Besar di Tengah */}
  <Image
    src="/Logo_Telkom_University_potrait.png" // Ganti dengan path logo Anda
    style={{
      width: 180,
      height: 'auto',
      marginVertical: 70,
      alignSelf: 'center',
    }}
  />

<View style={styles.infoRow}>
  <Text style={styles.infoLabel}>Nama UPPS / Kampus Cabang</Text>
  <Text style={styles.infoValue}>: {assessment.name}</Text>
</View>

<View style={styles.infoRow}>
  <Text style={styles.infoLabel}>Email</Text>
  <Text style={styles.infoValue}>: {assessment.email}</Text>
</View>

<View style={styles.infoRow}>
  <Text style={styles.infoLabel}>Alamat</Text>
  <Text style={styles.infoValue}>: {assessment.address}</Text>
</View>

<View style={styles.infoRow}>
  <Text style={styles.infoLabel}>Student Body</Text>
  <Text style={styles.infoValue}>: {assessment.studentBody}</Text>
</View>

<View style={styles.infoRow}>
  <Text style={styles.infoLabel}>Jumlah Prodi</Text>
  <Text style={styles.infoValue}>: {assessment.jumlahProdi}</Text>
</View>

<View style={styles.infoRow}>
  <Text style={styles.infoLabel}>Jumlah Prodi Terakreditasi Unggul</Text>
  <Text style={styles.infoValue}>: {assessment.jumlahProdiUnggul}</Text>
</View>

<View style={styles.infoRow}>
  <Text style={styles.infoLabel}>Maturity Level</Text>
  <Text style={styles.infoValue}>: {assessment.maturityLevelName}</Text>
</View>
</Page>

          {/* PAGE 2: Radar Chart + Maturity Level */}
          <Page size="A4" style={styles.page}>
            <Image src="/bg_document_sidebar.png" style={styles.sidebar} />
            <View style={styles.redBox}>
              <Text style={styles.redBoxTitle}>Overall Maturity Level</Text>
            </View>

            <View style={styles.redBox}>
              <Text style={[styles.redBoxTitle]}>
                {assessment.maturityLevelName}
              </Text>
              <Text style={[styles.center, { fontSize: 14, marginBottom: 6, border: '2px solid #fff', borderRadius: '5px' }]}>
                Skor: {assessment.maturityLevelMinScore} s.d. {assessment.maturityLevelMaxScore}
              </Text>
              <Text style={styles.redBoxContent}>
                {assessment.maturityLevelDescription || 'Tidak ada deskripsi.'}
              </Text>
            </View>
            <View style={styles.chartFrame}>
              <Text style={styles.chartTitle}>Radar Bar Chart</Text>
              <Image
                src={radarChartImages[index] || "https://via.placeholder.com/600x400/fef2f2/ef4444?text=Radar+Chart+Not+Available"}
                style={{ width: '100%', height: 300 }}
              />
            </View>
          </Page>

        {/* PAGE 3: Tabel Variabel */}
          <Page size="A4" style={styles.page}>
            <Image src="/bg_document_sidebar.png" style={styles.sidebar} />
            <View>
              <View style={styles.tableHeader}>
                <View style={{ width: '30%', borderRightWidth: 1, borderRightColor: '#fff' }}>
                  <Text style={styles.tableHeaderCell}>Nama Variable</Text>
                </View>
                <View style={{ width: '30%', borderRightWidth: 1, borderRightColor: '#fff' }}>
                  <Text style={styles.tableHeaderCell}>
                    Maturity Level – Per Variabel (Skor)
                  </Text>
                </View>
                <View style={{ width: '40%' }}>
                  <Text style={styles.tableHeaderCell}>Deskripsi</Text>
                </View>
              </View>
              {(variablesList[index] || []).map((v, i) => (
                <View key={i} style={styles.tableRow}>
                  <View style={{ width: '7%', borderRightWidth: 1, borderRightColor: '#ccc' }}>
                    <Text style={[styles.tableCell, {textAlign: 'center'}]}>V{i+1}</Text>
                  </View>
                  <View style={{ width: '23%', borderRightWidth: 1, borderRightColor: '#ccc' }}>
                    <Text style={styles.tableCell}>{v.name}</Text>
                  </View>
                  <View style={{ width: '30%', borderRightWidth: 1, borderRightColor: '#ccc' }}>
                    <Text style={[styles.tableCell, styles.center, {fontWeight: 'bold', fontStyle: 'italic'}]}>
                      {v.maturityLevel} ({v.point})
                    </Text>
                  </View>
                  <View style={{ width: '40%' }}>
                    {/* ✅ Perbaikan utama: tambahkan styles.center */}
                    <Text style={[styles.tableCell, styles.center]}>
                      {v.desc || 'Tidak ada deskripsi.'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Page>
        </React.Fragment>
      ))}
    </Document>
  );