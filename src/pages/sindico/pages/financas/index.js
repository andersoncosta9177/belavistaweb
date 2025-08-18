import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text, Card, Button } from "react-native-paper";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import {
  VictoryPie,
  VictoryBar,
  VictoryChart,
  VictoryTheme,
  VictoryAxis,
  VictoryTooltip,
  VictoryLine
} from "victory-native";
import GradientLayout from "../../../../../src/Utils/gradiente";
import { Dimensions } from "react-native";
import { ref, push, onValue, off, remove, set } from "firebase/database";
import {db} from '../../../../database/firebaseConfig'

// Função para formatar valores em reais
const formatarMoeda = (valor) => {
  if (typeof valor !== 'number') {
    valor = parseFloat(valor) || 0;
  }
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  });
};

const FinancasScreen = () => {
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filtro, setFiltro] = useState('todas');
  const [periodo, setPeriodo] = useState('ultimas');
  const [modalVisible, setModalVisible] = useState(false);
  const [novaTransacao, setNovaTransacao] = useState({
    tipo: "receita",
    valor: "",
    descricao: "",
    data: new Date().toLocaleDateString("pt-BR"),
  });
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const transacoesFiltradas = React.useMemo(() => {
    if (!transacoes || transacoes.length === 0) return [];
    
    return transacoes.filter(transacao => {
      // Filtro por tipo
      if (filtro === 'receitas' && transacao.tipo !== 'receita') return false;
      if (filtro === 'despesas' && transacao.tipo !== 'despesa') return false;
      
      // Filtro por período
      if (periodo === 'ultimas') return true;
      
      const transDate = transacao.criadoEm ? 
        new Date(transacao.criadoEm) : 
        new Date(transacao.data.split('/').reverse().join('-'));
      
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      if (periodo === 'dia') {
        return transDate.toDateString() === hoje.toDateString();
      }
      
      if (periodo === 'semana') {
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        return transDate >= inicioSemana;
      }
      
      if (periodo === 'mes') {
        return transDate.getMonth() === hoje.getMonth() && 
               transDate.getFullYear() === hoje.getFullYear();
      }
      
      return true;
    });
  }, [transacoes, filtro, periodo]);

  useEffect(() => {
    const transacoesRef = ref(db, "DadosBelaVista/administracao/financas");

    const carregarTransacoes = onValue(transacoesRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const transacoesArray = Object.entries(data).map(([id, transacao]) => ({
            id,
            ...transacao,
          }));
          setTransacoes(transacoesArray);
        } else {
          setTransacoes([]);
        }
      } catch (error) {
        console.error("Erro ao processar transações:", error);
        setTransacoes([]);
      } finally {
        setLoading(false);
      }
    });

    return () => off(transacoesRef);
  }, []);

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const formatWeekRange = (startDate) => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return `${startDate.getDate()}/${startDate.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`;
  };

  const calcularDadosSemanais = () => {
    const transacoesMesAtual = transacoes.filter(transacao => {
      const transDate = new Date(transacao.criadoEm || transacao.data);
      return transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear;
    });

    const semanas = {};
    
    transacoesMesAtual.forEach(transacao => {
      const transDate = new Date(transacao.criadoEm || transacao.data);
      const weekStart = getStartOfWeek(transDate);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!semanas[weekKey]) {
        semanas[weekKey] = {
          startDate: weekStart,
          receitas: 0,
          despesas: 0
        };
      }
      
      if (transacao.tipo === 'receita') {
        semanas[weekKey].receitas += parseFloat(transacao.valor) || 0;
      } else {
        semanas[weekKey].despesas += parseFloat(transacao.valor) || 0;
      }
    });

    const semanasOrdenadas = Object.values(semanas).sort((a, b) => a.startDate - b.startDate);
    
    return {
      labels: semanasOrdenadas.map(week => formatWeekRange(week.startDate)),
      datasets: [{
        data: semanasOrdenadas.map(week => week.receitas - week.despesas),
        colors: semanasOrdenadas.map(() => 
          `hsl(${Math.floor(Math.random() * 60 + 200)}, 80%, 60%)`
        )
      }]
    };
  };

  const totalReceitas = transacoes
    ? transacoes
        .filter((t) => t.tipo === "receita")
        .reduce((sum, t) => sum + (parseFloat(t.valor) || 0), 0)
    : 0;

  const totalDespesas = transacoes
    ? transacoes
        .filter((t) => t.tipo === "despesa")
        .reduce((sum, t) => sum + (parseFloat(t.valor) || 0), 0)
    : 0;
  
  const totalSaldo = totalReceitas - totalDespesas;
  const saldo = totalReceitas - totalDespesas;

  const porcentagemLucro =
    totalReceitas > 0
      ? (((totalReceitas - totalDespesas) / totalReceitas) * 100).toFixed(1)
      : 0;

  const adicionarTransacao = async () => {
    if (!novaTransacao.valor || !novaTransacao.descricao) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);

      const transacoesRef = ref(db, "DadosBelaVista/administracao/financas");
      const novaTransacaoRef = push(transacoesRef);

      await set(novaTransacaoRef, {
        tipo: novaTransacao.tipo,
        valor: parseFloat(novaTransacao.valor.replace(/\./g, '').replace(',', '.')) || 0,
        descricao: novaTransacao.descricao,
        data: new Date().toLocaleDateString("pt-BR"),
        criadoEm: new Date().toISOString(),
      });

      setModalVisible(false);
      setNovaTransacao({
        tipo: "receita",
        valor: "",
        descricao: "",
        data: new Date().toLocaleDateString("pt-BR"),
      });
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      Alert.alert("Erro", "Não foi possível salvar a transação");
    } finally {
      setLoading(false);
    }
  };

  const deletarTransacao = async (id) => {
    try {
      Alert.alert(
        "Confirmar Exclusão",
        "Tem certeza que deseja excluir esta transação?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Excluir",
            onPress: async () => {
              setLoading(true);
              const transacaoRef = ref(
                db,
                `DadosBelaVista/administracao/financas/${id}`
              );
              await remove(transacaoRef);
            },
          },
        ]
      );
    } catch (error) {
      console.error("Erro ao deletar transação:", error);
      Alert.alert("Erro", "Não foi possível remover a transação");
    } finally {
      setLoading(false);
    }
  };

  // Dados para gráficos
  const pieChartData = [
    {
      x: "Receitas",
      y: totalReceitas,
      color: "#7226ff",
    },
    {
      x: "Despesas",
      y: totalDespesas,
      color: "#F44336",
    },
  ];

  const barChartData = {
    labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
    datasets: [
      {
        data: [1500, 1200, 1800, 2000],
        colors: [
          "rgb(182, 197, 95)",
          "rgb(105, 240, 123)",
          "rgb(87, 245, 237)",
          "rgb(250, 171, 52)",
        ],
      },
    ],
  };

  function handleDeleteTransaction(id) {
    deletarTransacao(id);
  }

  return (
    <GradientLayout style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Controle Financeiro</Text>
        </View>

        {/* Cards Resumo */}
        <View style={styles.resumoContainer}>
          <Card style={styles.resumoCard}>
            <Card.Content>
              <Text style={styles.resumoTitle}>Receitas</Text>
              <Text style={styles.resumoValor}>{formatarMoeda(totalReceitas)}</Text>
              <FontAwesome5
                name="arrow-up"
                size={20}
                color="#B6F500"
                style={styles.resumoIcon}
              />
            </Card.Content>
          </Card>

          <Card style={styles.resumoCard}>
            <Card.Content>
              <Text style={styles.resumoTitle}>Despesas</Text>
              <Text style={styles.resumoValor}>{formatarMoeda(totalDespesas)}</Text>
              <FontAwesome5
                name="arrow-down"
                size={20}
                color="#F44336"
                style={styles.resumoIcon}
              />
            </Card.Content>
          </Card>

          <Card style={styles.resumoCard}>
            <Card.Content>
              <Text style={styles.resumoTitle}>Saldo</Text>
              <Text
                style={[
                  styles.resumoValor,
                  { color: totalSaldo >= 0 ? "#B6F500" : "#F44336" },
                ]}
              >
                {formatarMoeda(totalSaldo)}
              </Text>
              <MaterialIcons
                name={saldo >= 0 ? "attach-money" : "money-off"}
                size={20}
                color={saldo >= 0 ? "#B6F500" : "#F44336"}
                style={styles.resumoIcon}
              />
            </Card.Content>
          </Card>
        </View>

        {/* Gráficos mensais */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Balanço Mensal</Text>
              {totalSaldo >= 0 ? (
                <Text style={styles.lucroText}>Lucro: {porcentagemLucro}%</Text>
              ) : (
                <Text style={styles.prejuizoText}>
                  Prejuízo: {Math.abs(porcentagemLucro)}%
                </Text>
              )}
            </View>

            <View style={styles.chart}>
              {pieChartData.length > 0 ? (
                <VictoryPie
                  data={pieChartData}
                  width={Dimensions.get("window").width - 70}
                  height={240}
                  colorScale={pieChartData.map((item) => item.color)}
                  innerRadius={50}
                  padAngle={2}
                  labels={({ datum }) => `${datum.x}\n${formatarMoeda(datum.y)}`}
                  labelRadius={({ innerRadius }) => innerRadius + 35}
                  style={{
                    labels: {
                      fill: "#f9f9f9",
                      fontSize: 11,
                      fontWeight: "bold",
                      textAlign: "center",
                    },
                  }}
                />
              ) : (
                <View style={styles.emptyChart}>
                  <Text style={styles.emptyChartText}>
                    Adicione transações para visualizar o gráfico
                  </Text>
                </View>
              )}
            </View>

            {totalSaldo < 0 && (
              <View style={styles.alertContainer}>
                <MaterialIcons name="warning" size={20} color="#F44336" />
                <Text style={styles.alertText}>Saldo negativo este mês</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Gráfico de barras */}
        <Card style={styles.card}>
          <Card.Content style={styles.chartContainer}>
            <View style={styles.monthSelector}>
              <TouchableOpacity onPress={() => {
                const newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
                const newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
                setCurrentMonth(newMonth);
                setCurrentYear(newYear);
              }}>
                <MaterialIcons name="chevron-left" size={24} color="#f9f9f9" />
              </TouchableOpacity>
              
              <Text style={styles.monthText}>
                {new Date(currentYear, currentMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </Text>
              
              <TouchableOpacity onPress={() => {
                const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
                const newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
                setCurrentMonth(newMonth);
                setCurrentYear(newYear);
              }}>
                <MaterialIcons name="chevron-right" size={24} color="#f9f9f9" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.chartWrapper}>
              {calcularDadosSemanais().labels.length > 0 ? (
                <VictoryChart
                  width={Dimensions.get("window").width - 50}
                  height={240}
                  theme={VictoryTheme.material}
                  domainPadding={{ x: 20 }}
                  domain={{ y: [-Math.max(...calcularDadosSemanais().datasets[0].data.map(Math.abs)) * 1.2, Math.max(...calcularDadosSemanais().datasets[0].data.map(Math.abs)) * 1.2] }}
                >
                  <VictoryAxis
                    style={{
                      axis: { stroke: "#f9f9f9" },
                      tickLabels: {
                        fill: "#f9f9f9",
                        angle: -35,
                        textAnchor: "end",
                        fontSize: 11,
                      },
                    }}
                  />
                  <VictoryAxis
                    dependentAxis
                    style={{
                      axis: { stroke: "#f9f9f9" },
                      tickLabels: { fill: "#f9f9f9", fontSize: 11 },
                      grid: { stroke: "rgba(255,255,255,0.1)" }
                    }}
                  />
                  <VictoryBar
                    data={calcularDadosSemanais().datasets[0].data.map((value, index) => ({
                      x: calcularDadosSemanais().labels[index],
                      y: value,
                      fill: value >= 0 ? "#4CAF50" : "#F44336"
                    }))}
                    style={{
                      data: {
                        fill: ({ datum }) => datum.fill,
                        width: 30,
                      },
                      labels: {
                        fill: "#f9f9f9",
                        fontSize: 10,
                        fontWeight: "bold"
                      }
                    }}
                    labels={({ datum }) => formatarMoeda(datum.y)}
                  />
                  <VictoryLine
                    style={{
                      data: { stroke: "#f9f9f9", strokeWidth: 1 },
                    }}
                    y={() => 0}
                  />
                </VictoryChart>
              ) : (
                <View style={styles.emptyChart}>
                  <Text style={styles.emptyChartText}>
                    Nenhum dado disponível para este mês
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Lista de Transações */}
        <View style={styles.transacoesHeader}>
          <Text style={styles.sectionTitle}>Últimas Transações</Text>

          {transacoesFiltradas.length > 0 && (
            <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
              <MaterialIcons name="manage-search" size={32} color="#fff" />
            </TouchableOpacity>
          )}
          
          {showFilters && (
            <View style={styles.filterContainer}>
              <View style={styles.filterRow}>
                <Text style={styles.filterTitle}>Filtrar por:</Text>
                <TouchableOpacity 
                  style={[styles.filterButton, filtro === 'todas' && styles.filterButtonActive]}
                  onPress={() => setFiltro('todas')}
                >
                  <Text style={styles.filterButtonText}>Todas</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterButton, filtro === 'receitas' && styles.filterButtonActive]}
                  onPress={() => setFiltro('receitas')}
                >
                  <Text style={styles.filterButtonText}>Receitas</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterButton, filtro === 'despesas' && styles.filterButtonActive]}
                  onPress={() => setFiltro('despesas')}
                >
                  <Text style={styles.filterButtonText}>Despesas</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.filterRow}>
                <Text style={styles.filterTitle}>Período:</Text>
                <TouchableOpacity 
                  style={[styles.filterButton, periodo === 'ultimas' && styles.filterButtonActive]}
                  onPress={() => setPeriodo('ultimas')}
                >
                  <Text style={styles.filterButtonText}>Últimas</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterButton, periodo === 'dia' && styles.filterButtonActive]}
                  onPress={() => setPeriodo('dia')}
                >
                  <Text style={styles.filterButtonText}>Hoje</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterButton, periodo === 'semana' && styles.filterButtonActive]}
                  onPress={() => setPeriodo('semana')}
                >
                  <Text style={styles.filterButtonText}>Semana</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.filterButton, periodo === 'mes' && styles.filterButtonActive]}
                  onPress={() => setPeriodo('mes')}
                >
                  <Text style={styles.filterButtonText}>Mês</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.filterActionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.clearButton]}
                  onPress={() => {
                    setFiltro('todas');
                    setPeriodo('ultimas');
                  }}
                >
                  <Text style={styles.actionButtonText}>Limpar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.applyButton]}
                  onPress={() => setShowFilters(false)}
                >
                  <Text style={styles.actionButtonText}>Aplicar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#7226ff" style={styles.loadingIndicator} />
        ) : transacoesFiltradas.length > 0 ? (
          transacoesFiltradas.map((transacao) => (
            <Card key={transacao.id} style={styles.transacaoCard}>
              <TouchableOpacity
                style={styles.deleteIcon}
                onPress={() => handleDeleteTransaction(transacao.id)}
              >
                <MaterialIcons name="delete-outline" size={22} color="#F44336" />
              </TouchableOpacity>
              <Card.Content style={styles.transacaoContent}>
                <View style={styles.transacaoInfo}>
                  <MaterialIcons
                    name={transacao.tipo === "receita" ? "attach-money" : "money-off"}
                    size={24}
                    color={transacao.tipo === "receita" ? "#4CAF50" : "#F7374F"}
                  />
                  <View style={styles.transacaoTextos}>
                    <Text style={styles.transacaoDescricao}>
                      {transacao.descricao}
                    </Text>
                    <Text style={styles.transacaoData}>
                      {new Date(transacao.criadoEm || transacao.data).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.transacaoValor,
                    {
                      color: transacao.tipo === "receita" ? "#B6F500" : "#F7374F",
                    },
                  ]}
                >
                  {transacao.tipo === "receita" ? "+" : "-"} {formatarMoeda(transacao.valor)}
                </Text>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
        )}

        {/* Modal para nova transação */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#00bcb4', '#4568DC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalContent}
            >
              <Text style={styles.modalTitle}>Nova Transação</Text>

              <View style={styles.tipoContainer}>
                <TouchableOpacity
                  style={[
                    styles.tipoButton,
                    novaTransacao.tipo === "receita" &&
                      styles.tipoButtonSelected,
                  ]}
                  onPress={() =>
                    setNovaTransacao({ ...novaTransacao, tipo: "receita" })
                  }
                >
                  <Text style={styles.tipoButtonText}>Receita</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tipoButton,
                    novaTransacao.tipo === "despesa" &&
                      styles.tipoButtonSelected,
                  ]}
                  onPress={() =>
                    setNovaTransacao({ ...novaTransacao, tipo: "despesa" })
                  }
                >
                  <Text style={styles.tipoButtonText}>Despesa</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Valor (ex: 1.000,00)"
                placeholderTextColor="#fff"
                keyboardType="numeric"
                value={novaTransacao.valor}
                onChangeText={(text) =>
                  setNovaTransacao({ ...novaTransacao, valor: text })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Descrição"
                placeholderTextColor="#fff"
                value={novaTransacao.descricao}
                onChangeText={(text) =>
                  setNovaTransacao({ ...novaTransacao, descricao: text })
                }
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={adicionarTransacao}
                >
                  <Text style={styles.confirmButtonText}>Adicionar</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </Modal>
      </ScrollView>
      <TouchableOpacity
        style={styles.fixedAddButton}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </GradientLayout>
  );
};

// ... (mantenha os estilos exatamente como estão)

export default FinancasScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f9f9f9",
    textAlign: "center",
    marginBottom: 10,
  },
  resumoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  resumoCard: {
    flex: 1,
    margin: 2,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    elevation: 0,
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    borderColor: "transparent",
  },
  resumoTitle: {
    fontSize: 12,
    color: "#f9f9f9",
    textAlign: "center",
    fontWeight: "bold",

  },
  resumoValor: {
    fontSize: 10,
    color: "#f9f9f9",
    textAlign: "center",
    marginVertical: 6,
    fontWeight: "700",
  },
  resumoIcon: {
    alignSelf: "center",
    marginTop: 5,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginHorizontal: 15,
  },
  lucroText: {
    color: "#B6F500",
    fontWeight: "bold",
    fontSize: 14,
  },
  prejuizoText: {
    color: "#F44336",
    fontWeight: "bold",
    fontSize: 12,
  },
  alertContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 8,
    paddingRight: 15,
  },
  alertText: {
    color: "#F44336",
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "bold",
  },
  card: {
    borderRadius: 12,
    marginBottom: 15,
    width: "96%",
    marginHorizontal: "2%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    elevation: 0,
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    borderColor: "transparent",
    overflow: "hidden",
  },
  chartContainer: {
    paddingHorizontal: 0,
    paddingBottom: 25,
    borderRadius: 16,
    width: "94%",
    marginHorizontal: "3%",
  },
  chartWrapper: {
    overflow: "hidden",
    marginHorizontal: 10,
    paddingRight: 10,
    backgroundColor: "rgba(114, 38, 255, 0.3)",
    borderRadius: 10,
    padding: 10,
  },
  chart: {
    marginVertical: 8,
    marginHorizontal: 5, // Reduzimos a margem horizontal
    borderRadius: 10,
    backgroundColor: "rgba(114, 38, 255, 0.3)",
    padding: 10, // Reduzimos o padding
    overflow: "hidden", // Garantimos que nada vaze
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f9f9f9",
    // textAlign: "center",
    // marginBottom: 10,
  },
  transacoesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 15,
    marginBottom: 20,
    position: 'relative',

  },
  filterContainer: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#6C22A6',
    padding: 20,
    borderRadius: 10,
    zIndex: 100,
    width: Dimensions.get('window').width - 30,
    marginBottom: 13,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  filterTitle: {
    color: '#fff',
    marginRight: 10,
    fontSize: 14,
  },
  filterButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    marginRight: 8,
    // marginBottom: 8,
  },
  filterButtonActive: {
    backgroundColor: '#6EC207',
  },
  filterButtonText: {
    color: '#f9f9f9',
    fontSize: 12,
    borderRadius: 10,
    // paddingHorizontal: 10,
    // paddingVertical: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  fixedAddButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#6EC207",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  deleteIcon: {
    position: "absolute",
    top: -5,
    right: 15,
    zIndex: 1,
  },
  transacaoCard: {
    borderRadius: 10,
    marginBottom:25,
    marginHorizontal: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    elevation: 0,
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    borderColor: "transparent",
    paddingVertical: 12,
  },

  transacaoContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  monthSelector: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 10,
  paddingHorizontal: 20,
},
monthText: {
  color: '#f9f9f9',
  fontSize: 16,
  fontWeight: 'bold',
},
emptyChart: {
  height: 200,
  justifyContent: 'center',
  alignItems: 'center',
},
emptyChartText: {
  color: '#f9f9f9',
  textAlign: 'center',
},
  transacaoInfo: {
    flexDirection: "row",
    alignItems: "center",
    color: "#fff",
  },
  transacaoTextos: {
    marginLeft: 6,
  },
  transacaoDescricao: {
    fontSize: 14,
    color: "#fff",
  },
  transacaoData: {
    fontSize: 12,
    color: "#fff",
  },
  transacaoValor: {
    fontSize: 12,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    borderRadius: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  tipoContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  tipoButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    width: "45%",
    alignItems: "center",
  },
  tipoButtonSelected: {
    backgroundColor: "rgba(94, 19, 19, 0.3)",
  },
  tipoButtonText: {
    color: "#f9f9f9",
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    color: "#fff",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "#DC2525",
    padding: 12,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#f9f9f9",
    fontWeight: "bold",
  },
  confirmButtonText: {
    color: "#f9f9f9",
    fontWeight: "bold",
  },
  loadingIndicator: {
  marginTop: 40,
},
emptyText: {
  color: '#f9f9f9',
  textAlign: 'center',
  marginTop: 20,
  fontSize: 16,
},
filterActionButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 15,
},
actionButton: {
  flex: 1,
  padding: 10,
  borderRadius: 8,
  alignItems: 'center',
  marginHorizontal: 5,
},
applyButton: {
  backgroundColor: '#4CAF50',

},
clearButton: {
  backgroundColor: '#F44336',

},
actionButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 12
},
});

