#!/bin/bash

echo "🚀 Iniciando pipeline de testes K6..."

# Configurações
BASE_URL="http://localhost:3000"
MAX_RESPONSE_TIME="1000"
SUCCESS_RATE_THRESHOLD="0.95"
RESULTS_FILE="./performance/k6-results.json"

# Função para verificar se o servidor está rodando
check_server() {
    echo "🔍 Verificando se o servidor está respondendo..."
    
    for i in {1..30}; do
        if curl -f -s "$BASE_URL/health" > /dev/null 2>&1; then
            echo "✅ Servidor está respondendo!"
            return 0
        fi
        echo "⏳ Tentativa $i/30 - Aguardando servidor..."
        sleep 2
    done
    
    echo "❌ Servidor não respondeu após 60 segundos"
    return 1
}

# Função para executar testes K6
run_k6_tests() {
    echo "⚡ Executando testes K6..."
    
    k6 run \
        --env BASE_URL="$BASE_URL" \
        --env MAX_RESPONSE_TIME="$MAX_RESPONSE_TIME" \
        --env SUCCESS_RATE_THRESHOLD="$SUCCESS_RATE_THRESHOLD" \
        --out json="$RESULTS_FILE" \
        ./performance/api-performance.js
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo "✅ Testes K6 executados com sucesso!"
    else
        echo "⚠️ Testes K6 finalizaram com warnings/errors (código: $exit_code)"
    fi
    
    return $exit_code
}

# Função para gerar relatório HTML
generate_report() {
    echo "📊 Gerando relatório HTML..."
    
    if node ./performance/generate-report.js; then
        echo "✅ Relatório HTML gerado com sucesso!"
        return 0
    else
        echo "❌ Erro ao gerar relatório HTML"
        return 1
    fi
}

# Função para exibir resumo
show_summary() {
    echo ""
    echo "📋 RESUMO DA EXECUÇÃO"
    echo "===================="
    
    if [ -f "$RESULTS_FILE" ]; then
        echo "✅ Arquivo de resultados: $(du -h "$RESULTS_FILE" | cut -f1)"
    else
        echo "❌ Arquivo de resultados não encontrado"
    fi
    
    if [ -f "./performance/relatorio-teste-k6.html" ]; then
        echo "✅ Relatório HTML: $(du -h "./performance/relatorio-teste-k6.html" | cut -f1)"
    else
        echo "❌ Relatório HTML não encontrado"
    fi
    
    echo ""
    echo "📁 Arquivos gerados:"
    ls -la ./performance/ | grep -E "\.(json|html)$" || echo "Nenhum arquivo encontrado"
}

# Execução principal
main() {
    echo "🏁 Iniciando pipeline de testes de performance..."
    
    # Verificar se o servidor está rodando
    if ! check_server; then
        echo "❌ Pipeline falhou: servidor não está respondendo"
        exit 1
    fi
    
    # Executar testes K6
    local k6_exit_code=0
    if ! run_k6_tests; then
        k6_exit_code=$?
        echo "⚠️ Testes K6 falharam, mas continuando com geração do relatório..."
    fi
    
    # Gerar relatório HTML
    if ! generate_report; then
        echo "❌ Falha ao gerar relatório"
        exit 1
    fi
    
    # Exibir resumo
    show_summary
    
    echo "🏆 Pipeline de testes concluído!"
    
    # Retorna o código de saída dos testes K6
    exit $k6_exit_code
}

# Executar se chamado diretamente
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi