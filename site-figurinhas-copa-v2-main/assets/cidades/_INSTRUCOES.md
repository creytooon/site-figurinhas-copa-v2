# Pasta de imagens das 16 cidades-sede

## Como o sistema funciona

Cada card de cidade tenta carregar imagens nesta ordem:

1. **Imagem local** (`assets/cidades/{slug}.jpg`) — se você baixar e colocar aqui
2. **URL remota** (Unsplash, definida no `data.jsx`) — se a local não existir
3. **Fallback elegante** — gradiente colorido + nome da cidade gigante semi-transparente

## Pra ter as fotos AGORA garantidas

A maneira mais segura é baixar 16 fotos e colocá-las nesta pasta com os nomes exatos:

```
novayorknj.jpg
cidadedomexico.jpg
losangeles.jpg
miami.jpg
dallas.jpg
toronto.jpg
atlanta.jpg
vancouver.jpg
guadalajara.jpg
monterrey.jpg
kansascity.jpg
filadlfia.jpg
boston.jpg
seattle.jpg
houston.jpg
sanfrancisco.jpg
```

## Sugestões de busca (Unsplash, Pexels, Pixabay — todos uso comercial livre)

- **Nova York**: "New York skyline night Empire State"
- **Cidade do México**: "Mexico City Angel Independencia"
- **Los Angeles**: "Los Angeles downtown skyline"
- **Miami**: "Miami beach skyline night"
- **Dallas**: "Dallas skyline Texas"
- **Toronto**: "Toronto CN Tower skyline"
- **Atlanta**: "Atlanta Georgia skyline night"
- **Vancouver**: "Vancouver British Columbia skyline"
- **Guadalajara**: "Guadalajara cathedral Mexico"
- **Monterrey**: "Monterrey Cerro de la Silla mountain"
- **Kansas City**: "Kansas City Missouri skyline"
- **Filadélfia**: "Philadelphia skyline city hall"
- **Boston**: "Boston skyline financial district"
- **Seattle**: "Seattle Space Needle Mount Rainier"
- **Houston**: "Houston Texas skyline"
- **San Francisco**: "San Francisco Golden Gate Bridge"

## Tamanho recomendado
- Largura: 1280px - 1600px
- Proporção: 16:9
- Tamanho do arquivo: ≤ 300 KB (use [tinyjpg.com](https://tinyjpg.com))
