  import React from 'react';
  import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
  } from '@react-pdf/renderer';

  /* ================= TYPES ================= */
  interface Assessment {
    name: string;
    email: string;
    alamat: string;
    studentBody: number;
    jumlahProdi: number;
    jumlahProdiUnggul: string;
    maturityLevelName: string;
    maturityLevelDescription: string;
    periodeAssessment: string;
  }

  interface VariableReport {
    id: string;
    name: string;
    pointPercent: number;
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
      fontFamily: 'Helvetica',
      fontSize: 11,
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
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
    },
    subtitle: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 4,
    },
    period: {
      fontSize: 12,
      textAlign: 'center',
      marginBottom: 20,
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
      backgroundColor: '#f8d7da',
      padding: '18 22',
      borderRadius: 6,
      border: '1px solid #e74c3c',
      marginBottom: 25,
    },
    redBoxTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
    },
    redBoxContent: {
      fontSize: 11,
      textAlign: 'justify',
    },
    chartFrame: {
      border: '1px solid #e74c3c',
      borderRadius: 6,
      padding: '15 20',
      marginBottom: 20,
    },
    chartTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#ed3237',
      borderWidth: 1,
      borderColor: '#ed3237',
    },
    tableHeaderCell: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 10,
      padding: 6,
      textAlign: 'center',
    },
    tableRow: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: '#ccc',
    },
    tableCell: {
      fontSize: 8,
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
  <Text style={[styles.title, { fontSize: 14, marginBottom: 5 }]}>
    TRANSFORMATION MATURITY ASSESSMENT
  </Text>
  <Text style={[styles.subtitle, { fontSize: 12, marginBottom: 10 }]}>
    Assessment Result
  </Text>

  {/* Logo Besar di Tengah */}
  <Image
    src="/Logo_Telkom_University_potrait.png" // Ganti dengan path logo Anda
    style={{
      width: 180,
      height: 'auto',
      marginVertical: 15,
      alignSelf: 'center',
    }}
  />

  {/* Periode Assessment */}
  <Text style={[styles.period, { fontSize: 10, marginBottom: 20 }]}>
    Periode Assessment: {assessment.periodeAssessment}
  </Text>

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
  <Text style={styles.infoValue}>: {assessment.alamat}</Text>
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
            <Image src="/sidebar-curvy.png" style={styles.sidebar} />
            <View style={styles.redBox}>
              <Text style={styles.redBoxTitle}>Overall Maturity Level</Text>
              <Text style={[styles.center, { fontSize: 12, marginBottom: 6 }]}>
                Skor: 90,1% s.d. 100%
              </Text>
              <Text style={[styles.center]}>
                {assessment.maturityLevelName}
              </Text>
              <Text style={styles.redBoxContent}>
                {assessment.maturityLevelDescription || 'Tidak ada deskripsi.'}
              </Text>
            </View>
            <View style={styles.chartFrame}>
              <Text style={styles.chartTitle}>Radar Bar Chart</Text>
              <Image
                src={radarChartImages[index] || "https://via.placeholder.com/600x400/fef2f2/ef4444?text=Radar+Chart+Not+Available"}
                style={{ width: '100%', height: 220 }}
              />
            </View>
          </Page>

        {/* PAGE 3: Tabel Variabel */}
          <Page size="A4" style={styles.page}>
            <Image src="/sidebar-curvy.png" style={styles.sidebar} />
            <View>
              <View style={styles.tableHeader}>
                <View style={{ width: '25%', borderRightWidth: 1, borderRightColor: '#fff' }}>
                  <Text style={styles.tableHeaderCell}>Nama Variable</Text>
                </View>
                <View style={{ width: '35%', borderRightWidth: 1, borderRightColor: '#fff' }}>
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
                  <View style={{ width: '25%', borderRightWidth: 1, borderRightColor: '#ccc' }}>
                    <Text style={styles.tableCell}>{v.name}</Text>
                  </View>
                  <View style={{ width: '35%', borderRightWidth: 1, borderRightColor: '#ccc' }}>
                    <Text style={[styles.tableCell, styles.center]}>
                      {v.maturityLevel} ({v.pointPercent}%)
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