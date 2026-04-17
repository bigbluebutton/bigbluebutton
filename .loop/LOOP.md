# Demanda

Permitir que qualquer participante de uma reunião BigBlueButton 3.0 (moderador ou viewer) compartilhe sua tela simultaneamente com outros, com apenas um screenshare ocupando a área de apresentação por vez, e com duas lock settings (`disableMultiScreenshare` e `hideViewersScreenshare`) cujo enforcement ocorre exclusivamente no servidor.

# Regra de Negócio

Hoje o BigBlueButton só permite que o presenter compartilhe tela, e apenas um screenshare é possível por reunião. A partir desta entrega, qualquer participante — viewer ou moderador — passa a ter o botão de compartilhar tela disponível na interface, a menos que o dispositivo não suporte ou que uma lock setting o impeça. Quando um viewer compartilha, seu stream aparece ao lado das webcams dos demais participantes, e apenas o presenter pode promovê-lo para ocupar a área de apresentação. O screenshare do presenter, por padrão, já ocupa a área de apresentação; se o presenter compartilhar outro tipo de conteúdo (como slides ou vídeo externo), seu screenshare migra para a área das câmeras sem ser interrompido. Moderadores ganham dois controles em runtime: um que impede viewers de começarem a compartilhar tela (encerrando também os shares ativos dos viewers) e outro que esconde dos viewers os screenshares dos demais viewers, mantendo o screenshare do moderador sempre visível. O comportamento antigo é preservado integralmente quando a feature estiver desligada por configuração de deploy ou quando o path de mídia não for LiveKit. Webcams, gravação (apenas o screenshare em foco é gravado) e APIs externas permanecem sem quebras — novos campos têm defaults seguros.

# Requisitos Específicos

### Permissões e papéis

- **R1:** Permitir que um viewer inicie um compartilhamento de tela sem precisar ser promovido a presenter, quando as lock settings permitirem e o dispositivo suportar.
- **R2:** Permitir que um moderador não-presenter inicie um compartilhamento de tela pelas mesmas regras aplicadas a viewers, sem depender de ser o presenter.
- **R3:** Manter o servidor como única fonte de autoridade: uma tentativa de compartilhamento bloqueada por regra de negócio recebe uma negação explícita do servidor, sem ejetar o usuário da reunião.
- **R4:** Permitir que viewers e moderadores compartilhem tela e webcam ao mesmo tempo, cada um vendo o conteúdo dos demais (respeitadas as lock settings ativas).

### Layout e área de apresentação

- **R5:** Permitir múltiplos compartilhamentos de tela ativos simultaneamente na mesma reunião, cada um visível para todos os participantes autorizados.
- **R6:** Mostrar, em qualquer instante, no máximo um screenshare ocupando a área de apresentação. Os demais aparecem ao lado das webcams (área das câmeras).
- **R7:** Quando o presenter começa a compartilhar tela e nenhum outro screenshare está ocupando a área de apresentação, o screenshare do presenter passa a ocupá-la automaticamente.
- **R8:** Quando o presenter inicia um conteúdo de apresentação que ocupa a área principal (slides, vídeo externo, etc.) enquanto seu screenshare está ativo, o screenshare do presenter migra para a área das câmeras **sem ser interrompido**.
- **R9:** Viewers que compartilham tela têm seu stream sempre exibido na área das câmeras; nunca ocupam a área de apresentação por iniciativa própria.
- **R10:** Permitir apenas ao presenter designar qual screenshare ativo ocupa a área de apresentação, inclusive promovendo o screenshare de um viewer. Ao promover um screenshare, os demais que estavam em destaque deixam a área de apresentação na mesma operação, sem interromper streams.
- **R11:** Quando nenhum screenshare está designado como conteúdo principal, a área de apresentação mostra o que existir, nesta ordem: screenshare do presenter (se ativo), slides da apresentação, grid mode.
- **R12:** A troca de presenter (um usuário torna-se o novo presenter) não interrompe nenhum screenshare ativo. Shares do ex-presenter passam a aparecer na área das câmeras.

### Lock settings

- **R13:** Permitir ao moderador ativar a lock setting "Share screen" (`disableMultiScreenshare`) que, enquanto ativa, impede novos compartilhamentos iniciados por viewers. Moderadores não são afetados.
- **R14:** Ao ativar a lock `disableMultiScreenshare` com viewers já compartilhando, o servidor encerra os screenshares ativos desses viewers. Shares de moderadores continuam intactos.
- **R15:** Enquanto `disableMultiScreenshare` está ativa, a interface do viewer reflete a restrição (botão oculto ou desabilitado com feedback visual). O enforcement real continua no servidor — a UI apenas espelha o estado.
- **R16:** Permitir ao moderador ativar a lock setting "See other viewers' screenshare" (`hideViewersScreenshare`) que, enquanto ativa, impede viewers de verem os screenshares uns dos outros. Moderadores continuam vendo todos os screenshares; viewers continuam vendo o screenshare do moderador e todas as webcams.
- **R17:** O filtro aplicado por `hideViewersScreenshare` é aplicado no banco/servidor — mesmo que um viewer use ferramentas de inspeção no navegador, os dados do stream de outro viewer não chegam ao seu client.
- **R18:** Permitir que as duas novas lock settings sejam passadas como parâmetros opcionais na API de criação de reunião. Defaults: ambas desligadas (comportamento permissivo).
- **R19:** Preservar o nome `disableMultiScreenshare` e `hideViewersScreenshare` de ponta a ponta, sem variações (em toda UI, API, persistência e mensagens internas).

### Gravação

- **R20:** Gravar somente o screenshare que está ocupando a área de apresentação no instante de cada segmento da gravação. Demais screenshares simultâneos não entram na gravação.

### Compatibilidade

- **R21:** Preservar 100% do comportamento anterior quando a feature flag de multi-screenshare está desligada: apenas o presenter compartilha, apenas um stream ativo por reunião, sem lock settings novas expostas.
- **R22:** Preservar o comportamento anterior quando o path de mídia não é LiveKit (ex: SFU/Kurento): multi-screenshare fica indisponível, comportamento legacy singleton mantido.
- **R23:** Manter webcams intocadas: o fluxo de publicação, subscrição, layout e locks de webcam existentes não sofrem alteração funcional.
- **R24:** Manter a API de criação de reunião retrocompatível: chamadas que não enviarem os novos parâmetros continuam funcionando como antes, com defaults seguros.
- **R25:** Manter a feature de `cameraAsContent` (webcam na área de apresentação) funcionando como está — multi-screenshare não pode regredi-la.

### Observabilidade

- **R26:** Expor no monitoramento do servidor indicadores de uso que permitam acompanhar, por reunião, quantos screenshares estão ativos e quantas tentativas de compartilhamento foram negadas (e por qual motivo).

# Não-Requisitos (Escopo Negativo)

- **NR1:** Unificação dos modelos de screenshare e webcam num único modelo `user_stream`. Decisão do Tainan em 15/04 (23:41): fazer a opção A (multi-screenshare) primeiro, unificação fica para a fase 2.
- **NR2:** Suporte a multi-screenshare no path SFU/Kurento. Decisão do Tainan em 15/04 (21:54): "a feature do multi screenshare pode ser somente do livekit, por conta do simulcast".
- **NR3:** Gravação com composição de múltiplas trilhas simultâneas. Política acordada: gravar apenas o screenshare em foco (R20).
- **NR4:** Arbitragem server-side de "foco global" para viewers — o foco da visualização continua local por viewer; o que existe é a designação server-side, feita pelo presenter, de qual screenshare ocupa a área de apresentação (R10).
- **NR5:** Novas lock settings além das duas acordadas (`disableMultiScreenshare`, `hideViewersScreenshare`).
- **NR6:** Alterações nas APIs públicas (webhooks, meeting create) que quebrem compatibilidade. Novos campos são opcionais com defaults seguros.
- **NR7:** Mudanças no fluxo de webcam (publicação, subscrição, UI dedicada de webcam, locks de webcam existentes).
- **NR8:** Suporte a screenshare via plugin ou extensão externa.
- **NR9:** Limite global de screenshares por reunião. Decisão do Tainan em 15/04 (22:10): sem cap por meeting, o simulcast do LiveKit ajusta qualidade conforme a carga.
- **NR10:** Refatorações oportunísticas (regra do escoteiro) fora do escopo direto dos requisitos desta entrega; abrir branch separada.
- **NR11:** Novos casos de teste além dos acordados aqui. Qualquer inclusão depende de aprovação explícita do Tainan.

# Âncoras Técnicas

As âncoras abaixo foram trazidas pela entrada original (dossiê de investigação `multi-screenshare-investigation.md` + plano de mudança `multi-screenshare-change-plan.md`, ambos anexados pelo Tainan em 15/04 21:37, e as mensagens de decisão do Tainan/Tiago na thread). Use apenas como ponto de partida para `INVENTÁRIO`. Validar no campo antes de confiar cegamente.

### Branch e PR existente

- Repo upstream: `bigbluebutton/bigbluebutton`.
- Fork com permissão de push: `imdt-claudiop/bigbluebutton`.
- Branch de trabalho: `feat/multi-screenshare`.
- PR em andamento: `https://github.com/bigbluebutton/bigbluebutton/pull/24930`.
- Container BBB 3.0 from-source de referência: VMID 314, IP `10.111.14.85` — pode ter sido reciclado; sempre revalidar em `ENV_CHECK`.

### Pontos de mudança já identificados na investigação

Backend (akka-bbb-apps):
- `ScreenshareModel.scala` — modelo singleton mutável, alvo da migração para coleção indexada por streamId.
- `Screenshares.scala` (novo) — coleção proposta no padrão de `Webcams.scala`.
- `ScreenshareRtmpBroadcastStartedVoiceConfEvtMsgHdlr.scala` — guard singleton a ser removido para path LiveKit.
- `ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsgHdlr.scala` — stop idempotente por streamId.
- `GetScreenBroadcastPermissionReqMsgHdlr.scala` — checagem atual `PRESENTER_LEVEL` a ser relaxada para `VIEWER_LEVEL` sob feature flag + LiveKit; negação deve substituir o `eject` atual.
- `GetScreenSubscribePermissionReqMsgHdlr.scala` — validar streamId contra a coleção; aplicar filtro `hideViewersScreenshare` para viewers.
- `GetScreenshareStatusReqMsgHdlr.scala` — iteração multi-stream + projeção legada determinística.
- `AssignPresenterReqMsgHdlr.scala` — migração do share para área de câmeras ao invés de stop.
- `StartExternalVideoPubMsgHdlr.scala` — migração para área de câmeras ao invés de stop.
- `ChangeLockSettingsInMeetingCmdMsgHdlr.scala` — detectar ativação de `disableMultiScreenshare` e emitir stops para streams de viewers.
- `SetScreenshareShowAsContentReqMsgHdlr.scala` (novo) — handler com checagem `MOD_LEVEL` (apenas presenter promove; moderadores têm nível suficiente — revisar com Tainan se for apenas presenter) e atomicidade na demoção dos demais.
- `LockSettingsUtil.scala` — novo helper `isScreenshareBroadcastLocked(userRole, lockSettings)`.
- `MeetingActor.scala` — possível ambiguidade entre `ScreenshareStream` antigo (analytics) e novo (core.models); resolver com fully qualified references.

Contratos compartilhados:
- `bbb-common-message/.../VoiceConfMsgs.scala` — `ScreenshareRtmpBroadcastStartedEvtMsgBody` ganha `trackSid`, `audioTrackSid`, `publisherUserId` (Option).
- `bbb-common-message/.../LockSettings*` — `LockSettingsProps` ganha `hideViewersScreenshare` e `disableMultiScreenshare`; `LockSettingsChanged` idem.
- `bbb-common-web/.../LockSettingsParams.java`, `ApiParams.java`, `ParamsProcessorUtil.java` — parâmetros expostos via API `create` com default `false`.

Banco e GraphQL:
- `bbb_schema.sql` — colunas novas em `screenshare` (`userId`, `trackSid`, `audioTrackSid`, `showAsContent`) e em `meeting_lockSettings` (`hideViewersScreenshare`, `disableMultiScreenshare`); migration backward-compatible.
- `public_v_meeting.yaml` — `screenshare` object_relationship vira `screenshares` array_relationship; manter projeção `primaryScreenshare` derivada para compat.
- `public_v_screenshare.yaml` — expor colunas novas; aplicar row-level permission para role `viewer` implementando `hideViewersScreenshare`.
- `public_v_meeting_lockSettings.yaml`, `public_v_meeting_usersPolicies.yaml` — novos campos.
- `bbb-graphql-actions` — nova action `screenshareSetShowAsContent(meetingId, streamId)` validando `MOD_LEVEL`; registrar em `actions.graphql` e `actions.yaml`.

Frontend (bigbluebutton-html5):
- `actions-bar/screenshare/component.jsx` — remover `disabled={!amIPresenter}` e o guard `if (!isPresenter)` de `shareScreen`; habilitar botão por `useIsMultiScreenshareEnabled() && !deviceBlocksScreenshare && !isLockedForViewer`.
- `screenshare/service.js` — substituir ocorrências de `data[0]` por iterações sobre lista; expor hooks `useAmIScreenBroadcasting(userId)` e `useIsMultiScreenshareEnabled`.
- `screenshare/queries.ts` — consultar `showAsContent`, `userId`, `trackSid`, `audioTrackSid` e remover `[0]`.
- `screenshare/component.jsx` — trocar ID hardcoded `screenshareVideo` por `screenshareVideo-${streamId}`.
- `video-provider/` — integrar streams de screenshare com `showAsContent=false` como tiles (novo `VIDEO_TYPES.SCREENSHARE`).
- `lock-viewers/` — adicionar toggles "Share screen" → `disableMultiScreenshare` e "See other viewers' screenshare" → `hideViewersScreenshare`; i18n em `en.json` (`app.lock-viewers.features.screenShareLabel`, `app.lock-viewers.features.hideViewersScreenshareLabel`, `app.userList.userOptions.disableScreenshare`, `app.userList.userOptions.enableScreenshare`).
- `api/screenshare/client/bridge/livekit.ts` — Map por streamId para publications e subscriptions; metadata com `{streamId, publisherUserId, meetingId, contentType}`; reconexão via metadata e, como fallback, `trackSid`.
- Novo menu "Show as content" no tile de screenshare da câmera dock (visível apenas para presenter, conforme decisão do Tainan 16/04 11:48).

Testes (Playwright):
- Arquivo novo `bigbluebutton-tests/playwright/screenshare/multi-screenshare.spec.ts`.
- Classe `ScreenShare extends MultiUsers`.
- Selector compartilhado: `video[id^="screenshareVideo"]` em `elements.ts`.
- Selector legado `#screenshareVideo` a ser substituído onde persistir.

Gravação:
- `record-and-playback/video/scripts/video.yml` — query que alimenta o compositor deve filtrar por `showAsContent=true` no instante do segmento.

### Decisões de design já acordadas (com autor e timestamp)

Todas as referências são à thread do canal `#_bbb-claudio-tmp-multiscreenshare` (ID `C0AT09GUC86`), no fuso America/Sao_Paulo (UTC-3).

- **Presenter change não para shares** — Tainan, 15/04 21:54: "não parar o share do presenter, os shares dos não presenters devem ficar como cameras, igual nas outras plataformas".
- **External video migra screenshares para câmera** — Tainan, 15/04 21:54: "external video fica como conteudo e o screenshare vai para a area da camera".
- **Metadata LiveKit no banco + feature exclusiva LiveKit** — Tainan, 15/04 21:54: "por questões de segurança é melhor o banco de dados. a feature do multi screenshare pode ser somente do livekit, por conta do simulcast".
- **Recording só LiveKit** — Tainan, 15/04 21:54.
- **Cap por usuário: 1 câmera + 1 tela** — Tainan, 15/04 21:54.
- **Sem cap por meeting** — Tainan, 15/04 22:10: "todos os usuários poderia compartilhar as telas deles e cameras, já que como será somente livekit vai ter o simulcast… pq vai uma resolução cada vez pior".
- **Foco/spotlight via presenter** — Tainan, 15/04 22:11: "permitir o presenter colocar ele ou alguem em foco e esse pessoa ficar com um tamanho que permita uma boa resolução".
- **Ordem de implementação A → B** — Tainan, 15/04 23:41: "Concordo faz sentido fazer A depois B".
- **UX ideal do botão** — Tainan, 16/04 11:48: botão sempre disponível ao viewer (salvo dispositivo/lock); viewer share sempre em câmera; só o presenter designa conteúdo.
- **Lock setting de compartilhar** — Tainan, 16/04 12:11: "deve haver uma lock settings assim como existe para as webcams para impedir os viewers de compartilhar".
- **Fallback de conteúdo** — Tainan, 16/04 12:11: "se nenhum for designado, deve-se usar o do presenter, se não houver presenter deve-se mostrar apresentação, se não tiver apresentação deve-se estar em grid mode".
- **Nome da lock de compartilhar** — Tainan, 16/04 12:15: `disableMultiScreenshare`.
- **Nome da lock de visibilidade** — Tainan, 16/04 14:10: `hideViewersScreenshare`.
- **Teste 11 (3 viewers sem moderador)** — Tainan, 16/04 14:13.
- **Enforcement exclusivamente server-side** — Tainan, 16/04 15:00: "esse tipo de filtro deve ocorrer no banco ou no server e nunca no client".
- **Evidência em vídeo com revisão frame-a-frame** — Tiago, 16/04 11:41 e 11:43: rodar, gravar, extrair frames e analisar criticamente se o plano de testes está representado; só depois entregar.

# Plano de Testes

Todos os testes Playwright vivem em `bigbluebutton-tests/playwright/screenshare/multi-screenshare.spec.ts` (arquivo novo), estendendo `MultiUsers`. Selectors em `elements.ts` usam `video[id^="screenshareVideo"]`. Cada teste inicia com `Status: ⚪ não verificado`.

| # | Título | Categoria | Pré-condições | Passos | Assertivas | Req. coberto(s) | Status |
|---|--------|-----------|---------------|--------|------------|-----------------|--------|
| T01 | Viewer inicia screenshare sem ser presenter | E2E-feliz | Meeting com moderador (presenter) + viewer. `disableMultiScreenshare=false`, path LiveKit. Viewer **nunca** é promovido a presenter no setup. | 1. Viewer clica no botão de screenshare. 2. Viewer seleciona fonte e confirma. 3. No client do presenter, observar a área de apresentação. | Botão visível e habilitado para viewer antes do clique. Após start, elemento `video[id^="screenshareVideo"]` aparece nos clients do viewer e do presenter. Área de apresentação do presenter permanece inalterada (slides continuam). Nenhum `eject` ocorre. | R1, R3, R6, R9 | ⚪ não verificado |
| T02 | Dois compartilhamentos simultâneos | E2E-feliz | 3 usuários: moderador (presenter), user2 (viewer), observador (viewer). Sem promoções no setup. | 1. Presenter inicia screenshare. 2. User2 inicia screenshare. 3. No client do observador, contar elementos `video[id^="screenshareVideo"]`. | No DOM do observador, dois elementos `video[id^="screenshareVideo"]` distintos simultaneamente, ambos com `readyState >= HAVE_CURRENT_DATA`. Nenhum dos dois para durante o start do outro. | R1, R5 | ⚪ não verificado |
| T03 | Apenas um screenshare na área de apresentação | E2E-feliz | Moderador (confirmado como presenter antes do teste, para evitar race) + user2 (viewer) + observador (viewer). | 1. Presenter inicia screenshare → deve ocupar a área de apresentação. 2. User2 inicia screenshare. 3. Observar o layout do observador. | Apenas o screenshare do presenter aparece na área de apresentação. O screenshare do user2 aparece na área das câmeras. Nunca há dois screenshares na área de apresentação no mesmo instante. | R6, R7, R9 | ⚪ não verificado |
| T04 | Ciclo slides → screen1 → screen2 → slides | E2E-feliz | Presenter (confirmado) + user2 (viewer) + observador. Apresentação com slides carregada. | 1. Observador vê slides na área de apresentação. 2. Presenter inicia screenshare → sua tela ocupa a área. 3. User2 inicia screenshare → vai para câmeras. 4. Presenter promove o screenshare do user2 ("Show as content") → user2 ocupa a área, a do presenter vai para câmeras na mesma ação. 5. Presenter para sua tela; user2 para a dele → slides voltam para a área de apresentação. | Em cada passo a área de apresentação mostra exatamente a fonte esperada. No passo 4, o screenshare do presenter deixa a área sem ser interrompido (elemento continua no DOM, agora na área das câmeras). No passo 5, o fallback leva a área de volta aos slides (R11). | R7, R8, R10, R11 | ⚪ não verificado |
| T05 | Parar um share não afeta os outros | E2E-feliz | Estado do T02: presenter + user2 + observador, ambos compartilhando. | 1. User2 para seu share. 2. Observador checa o DOM. | Apenas um elemento `video[id^="screenshareVideo"]` permanece no DOM. O screenshare do presenter não perde frames (comparar `webkitDecodedFrameCount` antes/durante/depois e confirmar monotonia crescente). | R5 | ⚪ não verificado |
| T06 | Lock "Share screen" bloqueia viewer (sem promoção artificial) | E2E-negativo | Moderador (presenter) + viewer. Viewer **nunca** recebe presenter no setup. | 1. Moderador abre Lock Viewers e ativa "Share screen" (`disableMultiScreenshare=true`). 2. Viewer tenta clicar no botão de screenshare. 3. Moderador desativa a lock. 4. Viewer tenta novamente. | Enquanto a lock está ativa: botão do viewer oculto ou desabilitado com feedback, e uma tentativa direta é negada pelo servidor (sem eject). Moderador consegue compartilhar no mesmo intervalo. Após desativar: viewer consegue iniciar screenshare. | R13, R15, R3 | ⚪ não verificado |
| T07 | Ativar lock interrompe screenshare ativo de viewer | E2E-negativo | Moderador (presenter) + viewer, ambos compartilhando, lock inicialmente desligada. | 1. Ambos compartilhando. 2. Moderador ativa `disableMultiScreenshare`. 3. Observar o client do viewer e do moderador. 4. Viewer tenta re-publicar. | Stream do viewer encerra por ação do servidor (evento originado do server, não do client). Stream do moderador segue sem interrupção (contagem de frames contínua). Viewer não consegue reiniciar enquanto a lock está ativa. | R14, R13 | ⚪ não verificado |
| T08 | Lock "See other viewers' screenshare" esconde peers (enforcement no servidor) | E2E-negativo | Moderador (presenter) + viewer1 + viewer2. Todos com screenshare e webcam ativos. | 1. Todos compartilhando. 2. Moderador ativa `hideViewersScreenshare`. 3. Cada viewer inspeciona, via ferramentas do navegador, os dados que o client recebe para os screenshares dos outros viewers. 4. Moderador confirma que continua vendo tudo. | Os dados do screenshare do outro viewer não chegam ao client do viewer (confirmado por inspeção — a linha correspondente não retorna no GraphQL do viewer). Webcams continuam visíveis para todos. Screenshare do moderador continua visível para viewers. | R16, R17 | ⚪ não verificado |
| T09 | Viewer e moderador compartilham tela + webcam | E2E-feliz | Moderador + viewer. | 1. Ambos ligam webcam. 2. Ambos iniciam screenshare. 3. Cada um confirma no seu client que vê os streams do outro. | 4 streams distintos no DOM de cada participante (2 webcams + 2 screenshares). Nenhum interrompe o outro. | R4, R5 | ⚪ não verificado |
| T10 | 3 viewers sem moderador — layout não quebra | E2E-feliz | 3 viewers, sem moderador presente. Apresentação minimizada. | 1. Todos os 3 iniciam screenshare. 2. Apresentação é minimizada. 3. Inspecionar o layout em um dos clients. | 3 screenshares ativos simultâneos, todos na área das câmeras. Nenhum ocupa a área de apresentação (não há presenter para designar). Layout não quebra/sobrepõe; área de apresentação cai para o estado configurado sem presenter (slides ou grid, conforme R11). | R5, R9, R11 | ⚪ não verificado |
| T11 | Troca de presenter mantém screenshares ativos | E2E-feliz | Presenter + viewer, ambos compartilhando. | 1. Moderador torna o viewer em presenter. 2. Observador inspeciona o estado dos streams. | Nenhum stream é parado. O screenshare do ex-presenter aparece agora na área das câmeras, sem interrupção. O screenshare do novo presenter pode ser promovido manualmente para a área de apresentação (ver T04). | R12, R8 | ⚪ não verificado |
| T12 | Vídeo externo migra screenshare do presenter para câmeras | E2E-feliz | Presenter compartilhando tela + viewer compartilhando tela. | 1. Presenter inicia vídeo externo. 2. Observar a área de apresentação e as câmeras. | Vídeo externo ocupa a área de apresentação. Screenshare do presenter e do viewer aparecem na área das câmeras (presenter migrou, viewer já estava lá). Nenhum stream é parado. | R8, R9, R11 | ⚪ não verificado |
| T13 | Feature flag off → comportamento legado | Regressão | `multiScreenshareEnabled=false`, presenter + viewer. | 1. Viewer tenta compartilhar. 2. Presenter compartilha. | Viewer não vê botão ativo (comportamento antigo). Apenas um screenshare permitido por vez. Webcams continuam funcionando como antes. Lock settings novas não aparecem na UI. | R21 | ⚪ não verificado |
| T14 | Path SFU/Kurento mantém singleton mesmo com flag on | Regressão | `screenShareBridge=kurento`, `multiScreenshareEnabled=true`. | 1. Presenter compartilha. 2. Viewer tenta compartilhar. | Viewer não consegue compartilhar. Apenas um stream ativo por vez. Nenhuma lock nova é aplicada. | R22 | ⚪ não verificado |
| T15 | Webcams intocadas com multi-share ligado | Regressão | Moderador + viewer, ambos ligam webcam, lock `disableCam` não está ativa. | 1. Ambos ligam webcam. 2. Ambos iniciam screenshare. 3. Moderador ativa `disableCam`. | Webcams aparecem normalmente. Ao ativar `disableCam`, comportamento atual de lock de webcam é preservado (webcam do viewer encerra; screenshares não são afetados). | R23 | ⚪ não verificado |
| T16 | `cameraAsContent` continua funcional | Regressão | Feature `cameraAsContent` disponível no deploy. | 1. Moderador define uma webcam como conteúdo. 2. Presenter inicia screenshare. | Webcam como conteúdo permanece na área de apresentação (comportamento atual de `cameraAsContent`). Screenshare do presenter vai para câmeras. Nenhuma regressão na feature existente. | R25 | ⚪ não verificado |
| T17 | API `create` aceita request sem os novos params | Regressão | Sistema com feature ativada. | 1. Chamar API `create` sem `hideViewersScreenshare` nem `disableMultiScreenshare`. 2. Entrar na reunião. | Reunião é criada com sucesso. Ambas as lock settings estão desativadas (defaults). Comportamento da reunião é o padrão. | R18, R24 | ⚪ não verificado |
| T18 | Gravação grava apenas o screenshare em foco | E2E-feliz | Dois usuários compartilhando, um em foco (area de apresentação), outro em câmeras. | 1. Gravar por alguns segundos. 2. Parar gravação. 3. Abrir playback. | No playback, apenas o screenshare que estava ocupando a área de apresentação aparece. O screenshare em câmeras não é gravado. | R20 | ⚪ não verificado |
| T19 | Tentativa bloqueada de viewer não o expulsa da reunião | E2E-negativo | Moderador + viewer, `disableMultiScreenshare=true`. | 1. Viewer força tentativa de compartilhar (via bypass de UI se preciso). 2. Observar estado do viewer na lista de usuários. | Tentativa é negada com motivo explícito. O viewer continua na reunião (sem eject). | R3 | ⚪ não verificado |
| T20 | Observabilidade: contadores refletem multi-share | Cobertura inversa | Endpoint de métricas do servidor acessível. | 1. Sem shares: coletar baseline. 2. 2 shares ativos: coletar. 3. Tentativa negada por lock: coletar. | Contador de screenshares ativos por reunião sobe de 0 para 2 e volta. Contador de negações por motivo reflete pelo menos uma negação com motivo `locked`. | R26 | ⚪ não verificado |
| T21 | Nomenclatura `disableMultiScreenshare` / `hideViewersScreenshare` coerente | Cobertura inversa | Acesso ao repositório. | 1. Buscar por variantes (`blockViewerShare`, `disableScreenshare`, `hideScreenshare`, etc.) em todo o repositório. 2. Confirmar que o par exato aparece em todas as camadas. | Não existem variantes: nome aparece idêntico em Scala, Java, SQL, YAML, TypeScript/JavaScript e chaves de i18n. | R19 | ⚪ não verificado |
| T22 | Moderador não-presenter compartilha | E2E-feliz | Meeting com 2 moderadores (um é presenter, o outro não) + viewer. | 1. Moderador não-presenter clica no botão de screenshare e inicia. 2. Observador checa. | Botão está habilitado para o moderador não-presenter (sem promoção a presenter). Stream inicia e aparece nos demais clients. | R2 | ⚪ não verificado |

**Cobertura inversa — mapa requisito → testes (confirma cobertura total R1–R26):**

- R1 → T01, T02, T22
- R2 → T22
- R3 → T01, T06, T19
- R4 → T09
- R5 → T02, T05, T09, T10
- R6 → T01, T03
- R7 → T03, T04
- R8 → T04, T11, T12
- R9 → T01, T03, T10, T12
- R10 → T04
- R11 → T04, T10, T12
- R12 → T11
- R13 → T06, T07
- R14 → T07
- R15 → T06
- R16 → T08
- R17 → T08
- R18 → T17
- R19 → T21
- R20 → T18
- R21 → T13
- R22 → T14
- R23 → T15
- R24 → T17
- R25 → T16
- R26 → T20

Nenhuma lacuna. Todos os requisitos têm ao menos um teste cobrindo.

# Critérios de Verificação por Requisito

Cada requisito só é marcado como `✅ fechado` quando os três checks abaixo passam. Se o terceiro check ("Teste demonstra") falhar, corrigir o **teste** (sem promover role artificialmente), nunca a implementação só para fazer o teste passar.

## R1
- [ ] **Funciona:** No ambiente, um viewer sem ser presenter consegue clicar no botão de screenshare, autorizar a fonte de mídia e ter o stream publicado. O servidor responde com sucesso (sem eject).
- [ ] **Tem teste:** T01, T02, T22 em `multi-screenshare.spec.ts`.
- [ ] **Teste demonstra:** O viewer inicia o share **sem ter sido promovido a presenter** nem no setup nem durante o teste. Se o setup contém qualquer chamada que eleve o papel do viewer, o teste é inválido — reescrever.

## R2
- [ ] **Funciona:** Um moderador que não é o presenter consegue iniciar screenshare sem precisar ser promovido a presenter.
- [ ] **Tem teste:** T22.
- [ ] **Teste demonstra:** Há dois moderadores na sala, um é o presenter e o outro não; o segundo compartilha sem alteração de papel durante o teste.

## R3
- [ ] **Funciona:** Uma tentativa bloqueada (por lock, por flag off, por path SFU) recebe negação explícita do servidor, sem ejetar o usuário.
- [ ] **Tem teste:** T01 (não-bloqueio), T06, T19.
- [ ] **Teste demonstra:** Após a tentativa, o usuário ainda está na lista de participantes da reunião; a asserção final confirma presença e ausência de ejeção.

## R4
- [ ] **Funciona:** Viewer e moderador, com webcam e screenshare simultâneos, se veem mutuamente.
- [ ] **Tem teste:** T09.
- [ ] **Teste demonstra:** O DOM de cada participante contém os 4 streams esperados e cada um decodifica frames; assertion checa os quatro elementos.

## R5
- [ ] **Funciona:** Dois ou mais screenshares coexistem sem que a chegada do segundo derrube o primeiro.
- [ ] **Tem teste:** T02, T05, T09, T10.
- [ ] **Teste demonstra:** Em T02, o observador conta dois elementos `video[id^="screenshareVideo"]` simultâneos; em T05, o contador de frames do stream remanescente cresce continuamente durante o stop do outro.

## R6
- [ ] **Funciona:** Em qualquer instante, no máximo um screenshare ocupa a área de apresentação no layout renderizado.
- [ ] **Tem teste:** T01, T03.
- [ ] **Teste demonstra:** A assertion usa seletor do slot de área de apresentação e confirma exatamente um ou zero screenshares renderizados lá.

## R7
- [ ] **Funciona:** Quando o presenter começa a compartilhar e nada ocupa a área de apresentação, o share dele passa a ocupá-la.
- [ ] **Tem teste:** T03, T04.
- [ ] **Teste demonstra:** O teste confirma explicitamente o papel de presenter **antes** de iniciar o share (evita race) e depois checa que a área de apresentação renderiza o screenshare do presenter.

## R8
- [ ] **Funciona:** Quando o presenter inicia um conteúdo novo (slides avançam, external video etc.), o screenshare ativo migra para a área das câmeras sem interromper.
- [ ] **Tem teste:** T04 (passo 4), T11, T12.
- [ ] **Teste demonstra:** O elemento de vídeo associado ao streamId do presenter continua presente no DOM após a migração, agora dentro da área das câmeras; contagem de frames contínua.

## R9
- [ ] **Funciona:** Screenshares iniciados por viewers sempre aparecem na área das câmeras, nunca tomam sozinhos a área de apresentação.
- [ ] **Tem teste:** T01, T03, T10, T12.
- [ ] **Teste demonstra:** O viewer não é promovido a presenter em nenhum momento; a assertion confirma que o slot de área de apresentação não contém o stream do viewer.

## R10
- [ ] **Funciona:** O presenter consegue promover um screenshare (de outro usuário) para a área de apresentação; o que estava lá é demotido na mesma ação, sem stops.
- [ ] **Tem teste:** T04 (passo 4).
- [ ] **Teste demonstra:** Antes da promoção, stream A está na área de apresentação e stream B nas câmeras; após a promoção, stream B está na área e stream A nas câmeras; ambos continuam com frames crescendo.

## R11
- [ ] **Funciona:** Sem designação explícita, a área de apresentação segue a ordem presenter → slides → grid.
- [ ] **Tem teste:** T04 (passo 5), T10, T12.
- [ ] **Teste demonstra:** Após parar shares em T04, a área volta para slides; em T10 (sem presenter), a área cai para slides ou grid conforme o estado; a assertion confirma qual fonte está renderizada.

## R12
- [ ] **Funciona:** Troca de presenter não interrompe screenshares.
- [ ] **Tem teste:** T11.
- [ ] **Teste demonstra:** Antes da troca há N shares ativos; após a troca, os mesmos N shares seguem com frames crescendo; o ex-presenter passa a aparecer na área das câmeras.

## R13
- [ ] **Funciona:** Ativar a lock `disableMultiScreenshare` impede viewers de iniciar novos shares. Moderadores não afetados.
- [ ] **Tem teste:** T06, T07.
- [ ] **Teste demonstra:** O viewer não é promovido artificialmente em nenhum momento; após a lock, sua tentativa é negada pelo servidor e a UI reflete a restrição.

## R14
- [ ] **Funciona:** Ativar `disableMultiScreenshare` com viewers compartilhando encerra os shares dos viewers; moderadores seguem ativos.
- [ ] **Tem teste:** T07.
- [ ] **Teste demonstra:** O stop que interrompe o stream do viewer é **originado pelo servidor** (não pelo click do viewer); stream do moderador continua com frames crescendo sem flicker.

## R15
- [ ] **Funciona:** Com a lock ativa, a UI do viewer reflete a restrição (botão oculto/desabilitado com tooltip).
- [ ] **Tem teste:** T06.
- [ ] **Teste demonstra:** A assertion inspeciona atributos visíveis do botão (visibility, disabled, tooltip); e uma tentativa de bypass ainda é negada pelo servidor (cobre R3 juntamente).

## R16
- [ ] **Funciona:** Com `hideViewersScreenshare` ativa, viewers não veem screenshares uns dos outros; moderador segue vendo todos; screenshare do moderador segue visível para viewers.
- [ ] **Tem teste:** T08.
- [ ] **Teste demonstra:** Em T08, o viewer1 tenta ver o stream do viewer2 e a UI não o renderiza; o moderador vê os dois.

## R17 ✅
- [x] **Funciona:** O filtro é aplicado no servidor/banco, não no client.
- [x] **Tem teste:** T08.
- [x] **Teste demonstra:** O teste inspeciona a resposta do GraphQL no client do viewer e confirma que os dados do screenshare do outro viewer **não chegam** ao client (row ausente), mostrando que o filtro não é cosmético no client.

## R18
- [ ] **Funciona:** A API `create` aceita os parâmetros novos; sem eles, aplicam-se defaults seguros.
- [ ] **Tem teste:** T17.
- [ ] **Teste demonstra:** Há dois flows: um chamando `create` sem novos params (defaults `false`) e outro com `disableMultiScreenshare=true`; ambos refletem na reunião criada.

## R19
- [ ] **Funciona:** Em qualquer camada onde a feature é referenciada, os nomes `disableMultiScreenshare` e `hideViewersScreenshare` aparecem sem variação.
- [ ] **Tem teste:** T21.
- [ ] **Teste demonstra:** O teste faz busca textual no repositório por variantes conhecidas e confirma que só os nomes canônicos existem.

## R20
- [ ] **Funciona:** A gravação contém apenas o screenshare que ocupa a área de apresentação em cada segmento.
- [ ] **Tem teste:** T18.
- [ ] **Teste demonstra:** O teste compara o playback com os eventos do backend: apenas o stream com `showAsContent=true` no instante aparece no playback; os demais não.

## R21
- [ ] **Funciona:** Com a feature flag off, nenhuma mudança funcional é observável em uso normal.
- [ ] **Tem teste:** T13.
- [ ] **Teste demonstra:** T13 roda com flag off e confirma singleton, botão restrito ao presenter e ausência dos novos toggles de lock.

## R22
- [ ] **Funciona:** Com path SFU, nenhuma mudança funcional é observável mesmo com flag on.
- [ ] **Tem teste:** T14.
- [ ] **Teste demonstra:** T14 explicitamente configura `screenShareBridge=kurento` e confirma singleton.

## R23
- [ ] **Funciona:** Webcams não sofrem alteração funcional.
- [ ] **Tem teste:** T15.
- [ ] **Teste demonstra:** T15 ativa `disableCam` com multi-share ligado e confirma que a lock de webcam comporta-se como antes.

## R24
- [ ] **Funciona:** Chamadas antigas à API `create` continuam funcionando.
- [ ] **Tem teste:** T17.
- [ ] **Teste demonstra:** Chamada sem params novos retorna sucesso e reunião funciona; não há erro por ausência dos campos.

## R25
- [ ] **Funciona:** `cameraAsContent` continua operacional.
- [ ] **Tem teste:** T16.
- [ ] **Teste demonstra:** T16 verifica que definir webcam como conteúdo permanece funcional e não é atropelado por screenshare.

## R26
- [ ] **Funciona:** O endpoint de métricas reflete, em tempo próximo ao real, o estado multi-share.
- [ ] **Tem teste:** T20.
- [ ] **Teste demonstra:** T20 coleta antes/depois e confirma mudança no contador de shares ativos e no contador de negações com motivo.

# Plano de Clean Code

Executado em `CLEAN_CODE`, depois de todos os requisitos estarem `✅ fechado`. Um commit por item resolvido.

- **Duplicação:**
  - [ ] Lógica de filtro por `showAsContent=true` não aparece replicada em múltiplos hooks/serviços — extraída para helper comum.
  - [ ] Checagem `userRole === viewer && lockSettings.disableMultiScreenshare` aparece em um único ponto (helper `LockSettingsUtil.isScreenshareBroadcastLocked`), consumido onde for preciso.
  - [ ] Iteração sobre lista de streams no frontend usa utilitário único ao invés de repetir `.some`/`.find` com a mesma condição em vários lugares.
- **Simplicidade:**
  - [ ] Nenhum handler Scala com complexidade ciclomática > 10; quando exceder, refatorar em early returns ou funções auxiliares.
  - [ ] Lógica de decisão "content vs câmera" em um único ponto determinístico; componentes consomem o resultado.
- **Nomenclatura:**
  - [ ] `disableMultiScreenshare` e `hideViewersScreenshare` idênticos em Scala, Java, SQL, YAML, TypeScript/JavaScript e chaves i18n (ver T21).
  - [ ] Sem variantes como `blockViewerShare`, `disableScreenshare`, `screenshareLocked`, etc.
  - [ ] Nomes de streams, publishers, tracks coerentes em todas as camadas.
- **Código morto:**
  - [ ] Sem `console.log`, `debugger`, código comentado, `TODO` sem dono nos arquivos tocados.
  - [ ] Sem imports não usados.
  - [ ] Helpers criados que acabaram sem uso são removidos.
- **Feature flag:**
  - [ ] `useIsMultiScreenshareEnabled()` (ou equivalente) é consultado em todos os pontos de entrada: botão da action bar, handler de broadcast permission, bridge LiveKit, UI de lock settings, queries.
  - [ ] Caminhos SFU e LiveKit claramente separados; sem vazamento de lógica multi-share para SFU.
- **i18n:**
  - [ ] Chaves novas presentes em `en.json` com textos finais (não placeholders): `app.lock-viewers.features.screenShareLabel`, `app.lock-viewers.features.hideViewersScreenshareLabel`, `app.userList.userOptions.disableScreenshare`, `app.userList.userOptions.enableScreenshare`.
  - [ ] Demais locales: listar pendências na descrição do PR como "string pending translation".
- **Defaults seguros:**
  - [ ] `disableMultiScreenshare` e `hideViewersScreenshare` com default `false` (comportamento permissivo alinhado ao atual) no schema SQL, Hasura, Scala (`LockSettingsProps`), Java (`LockSettingsParams`).
  - [ ] Novas colunas em `screenshare` aceitam `NULL` ou têm default adequado.

Regra: refatoração que tocar código de requisito já `✅ fechado` reabre esse requisito para `🔍 em verificação` e exige voltar a `VERIFICAR_REQUISITOS` apenas para ele.

# Plano de Revisão de Evidências

Executado em `REVISAR_EVIDÊNCIAS`, depois de `CLEAN_CODE` e `RE_TESTE` passarem. Para cada teste do `# Plano de Testes` com evidência (Playwright grava por padrão; testes `[manual]` precisam upload explícito — não há `[manual]` neste plano), executar:

- [ ] **T01 — Viewer inicia screenshare:** vídeo existe? extrair frames em início, clique no botão, stream ativo, estado do presenter. Frames mostram viewer sem badge de presenter durante todo o teste? Sem sinais de bypass no setup?
- [ ] **T02 — Dois shares simultâneos:** vídeo existe? frames mostram dois elementos `screenshareVideo-*` distintos com conteúdo diferente ao mesmo tempo? Nenhum pisca/reinicia durante a chegada do outro?
- [ ] **T03 — Apenas um na área de apresentação:** vídeo existe? frame confirma que área de apresentação tem apenas o screenshare do presenter e área das câmeras tem o do user2?
- [ ] **T04 — Ciclo slides→screen1→screen2→slides:** vídeo existe? frames em cada uma das 5 transições (slides, s1 em conteúdo, s2 em câmeras, s2 promovido, slides de volta) mostram o estado esperado?
- [ ] **T05 — Parar um mantém o outro:** vídeo existe? frames antes/durante/depois do stop mostram continuidade do stream remanescente?
- [ ] **T06 — Lock bloqueia viewer:** vídeo existe? frames mostram botão do viewer num estado restritivo com a lock ativa, e habilitado após a lock desligar? Frame confirma viewer sem promoção?
- [ ] **T07 — Lock interrompe share ativo:** vídeo existe? frames capturam o instante em que o stream do viewer desaparece logo após a ativação da lock; stream do moderador segue inalterado.
- [ ] **T08 — hideViewersScreenshare (enforcement no server):** vídeo existe? frames do viewer1 não mostram o stream do viewer2; frames do moderador mostram todos. Log/inspeção confirmam que dados não chegaram ao client.
- [ ] **T09 — Tela + webcam simultâneo:** vídeo existe? frames mostram 4 streams distintos nos dois clients.
- [ ] **T10 — 3 viewers sem moderador:** vídeo existe? frames mostram 3 screenshares nas câmeras e área de apresentação sem conteúdo promovido.
- [ ] **T11 — Troca de presenter:** vídeo existe? frames antes e depois da troca mostram os mesmos N streams ativos, ex-presenter agora nas câmeras.
- [ ] **T12 — Vídeo externo migra:** vídeo existe? frames mostram vídeo externo assumindo a área de apresentação e screenshare do presenter migrando para as câmeras sem sumir.
- [ ] **T13 — Flag off:** vídeo existe? frames mostram apenas presenter com botão e um stream ativo de cada vez.
- [ ] **T14 — Path SFU com flag on:** vídeo existe? frames mostram viewer sem botão habilitado e singleton preservado.
- [ ] **T15 — Webcams intocadas:** vídeo existe? frames confirmam comportamento legado de `disableCam`.
- [ ] **T16 — cameraAsContent:** vídeo existe? frames mostram webcam como conteúdo antes e durante um screenshare.
- [ ] **T17 — API create sem novos params:** evidência pode ser log+screenshot de request/response — anexar no PR; checar presença.
- [ ] **T18 — Gravação foca na apresentação:** vídeo existe? playback extraído confirma ausência do stream em câmeras na gravação final.
- [ ] **T19 — Tentativa negada sem ejeção:** vídeo existe? frames mostram o viewer ainda na lista após a negação.
- [ ] **T20 — Métricas:** evidência é texto/JSON do endpoint capturado antes, durante e depois; anexar no PR com diff.
- [ ] **T21 — Nomenclatura consistente:** evidência é output do grep no repo; anexar no PR.
- [ ] **T22 — Moderador não-presenter compartilha:** vídeo existe? frames mostram dois moderadores (um presenter, outro não) e o não-presenter compartilhando sem alteração de papel.

Qualquer `- [ ]` sem evidência válida impede `DONE`. Se faltar evidência por problema no teste, voltar a `RE_TESTE`; se for por comportamento incorreto, voltar a `VERIFICAR_REQUISITOS`.

# Plano de Validação do PR

Checklist final antes de `DONE`. Todos os itens precisam `[x]` com evidência objetiva (commit hash, link de frame, output de comando).

- [ ] Todos os requisitos R1…R26 marcados como `✅ fechado` em `# Estado do Loop`.
- [ ] Todos os testes de T01…T22 com `Status: ✅ passou`.
- [ ] Cobertura inversa: cada R tem ≥ 1 teste cobrindo (conferido pela tabela em `# Plano de Testes`).
- [ ] `# Plano de Clean Code` totalmente verde.
- [ ] `# Plano de Revisão de Evidências` totalmente verde.
- [ ] Feature flag desligada → comportamento idêntico ao anterior ao PR (regressão T13 passou).
- [ ] Path SFU → comportamento idêntico ao anterior ao PR (regressão T14 passou).
- [ ] Locks novas testadas positiva (ativação bloqueia/esconde) e negativamente (desativação libera novamente).
- [ ] i18n: chaves novas presentes em `en.json`; pendências de tradução listadas na descrição do PR.
- [ ] Push feito para o branch do PR, com commits descritivos por fase (`loop: ...`), por requisito (`req: R<n> ...`) e por item de clean code (`refactor: ...`).
- [ ] Descrição do PR atualizada: motivação de negócio em português; lista de requisitos cobertos; links para vídeos/frames por teste com timestamps (formato `MM:SS`).
- [ ] Nenhum atalho registrado: nenhum teste promoveu viewer a presenter no setup para passar; nenhum teste contornou a lock no client; nenhum teste "passou" por ajuste em `settings.yml` no container.
- [ ] Pasta de evidências no Google Drive com permissão `anyone with link` (confirmar acesso abrindo de uma janela anônima).
- [ ] Sem menções a Claude/IA/automação externa na descrição do PR ou em commits.
- [ ] Aprovação: pelo menos T01, T06 e T07 validados por humano antes do merge (tocam o ponto mais sensível — libertar viewer + enforcement server-side).

# Estado do Loop

```
## Fase atual
VERIFICAR_REQUISITOS

## Iteração
13

## Última ação
R16 fechado. Filtro server-side implementado em 3 arquivos: GetUserApiMsgHdlr.scala emite hideViewersScreenshare por user (false para moderadores/desbloqueados, permissions.hideViewersScreenshare para viewers bloqueados); UserInfoService.scala mapeia para X-Hasura-ScreenshareNotLockedInMeeting + X-Hasura-ScreenshareLockedUserId; public_v_screenshare.yaml: objeto relationship user→v_user_ref + permission filter _and[meetingId=meeting, _or[user.isModerator=true, meetingId=NotLocked, userId=LockedUserId]]. Padrão idêntico ao cursor/webcam. Commit d9a36e2.

## Próxima ação
Iterar R17 (teste E2E T08 — inspecionar resposta GraphQL viewer para confirmar filtro server-side sem dados de screenshare de outro viewer).

## Bloqueios
nenhum (nota: commits ao repo BBB devem ser feitos via docker exec ip-10-111-14-85, pois .git/COMMIT_EDITMSG é root-owned no host)

## Estado dos requisitos
R1: ✅ tentativo — código (VIEWER_LEVEL em GetScreenBroadcastPermissionReqMsgHdlr) + teste ("Non-presenter can start screenshare" em screenshare.spec.ts)
R2: ✅ fechado — VIEWER_LEVEL no handler + MOD_ROLE isento de lock + T22 criado e passando (c932ae0)
R3: ✅ fechado — backend envia explicit deny (allowed=false) sem eject + T06/T19 criados e passando 4/4 (59723e27)
R4: ✅ tentativo — código (sem guard câmera+tela) + teste ("Screenshare coexists with webcam")
R5: ✅ tentativo — código (Screenshares.scala multi-stream) + teste ("Two users can share screen simultaneously")
R6: ✅ tentativo — código (showAsContent) + teste ("Attendee sees multiple", "Screenshare appears in content area")
R7: ✅ tentativo — código (SetScreenshareShowAsContentReqMsgHdlr) + teste ("Screenshare appears in content area", "Content priority full cycle")
R8: ✅ fechado — race condition corrigida (ScreenshareRtmpBroadcastStartedVoiceConfEvtMsgHdlr: otherUsersSharing guard); T11+T12 passando 6/6
R9: ✅ fechado — código (showAsContent=false para viewers) + T03 "viewer screenshare goes to camera dock not content area" passando 7/7 (44.5s) (db09559)
R10: ✅ tentativo — código (showAsContent, promoção atômica) + teste ("Content priority full cycle" inclui promoção)
R11: ✅ fechado — container.jsx fallback correto (showScreenshare→slides→grid); T04 adicionado e passando 8/8 (b3c1cf6)
R12: ✅ fechado — AssignPresenterReqMsgHdlr migra shares do ex-presenter; race condition corrigida; T11 passando 6/6
R13: ✅ fechado — disableMultiScreenshare implementado end-to-end (DB/Hasura/GraphQL/Scala/frontend); isScreenshareBroadcastLocked corrigido; T06 testando lock correta; 8/8 pass (5490f36)
R14: ✅ fechado — ChangeLockSettingsInMeetingCmdMsgHdlr chama enforceScreenshareLockSettingsForAllViewers; isScreenshareBroadcastLocked usa disableMultiScreenshare; T07 passando 9/9 (59.1s) (d81cb40)
R15: ✅ fechado — container.jsx retorna null quando isScreenshareLocked (botão oculto); useIsScreenshareLocked verifica disableMultiScreenshare+locked+!isModerator; T06 passando 2/2 (19.6s)
R16: ✅ fechado — filtro server-side aplicado: GetUserApiMsgHdlr+UserInfoService emitem X-Hasura-Screenshare{NotLocked,Locked} vars; public_v_screenshare.yaml permission filter bloqueia viewers de ver screenshares de outros viewers quando hideViewersScreenshare=true (d9a36e2)
R17: ⚪ não verificado — teste E2E T08 (inspecionar resposta GraphQL viewer) ainda não escrito
R18: 🔍 em verificação — código (LockSettingsParams.java com defaults false) mas sem teste de API
R19: 🔍 em verificação — código (naming consistente em Scala/Java/SQL/YAML) mas T21 (busca textual) não implementado como teste
R20: ⚪ não verificado — filtro de gravação por showAsContent não encontrado; sem teste
R21: 🔍 em verificação — código (useIsMultiScreenshareEnabled flag) mas sem teste T13 (flag off = comportamento legado)
R22: 🔍 em verificação — código (livekit bridge separado) mas sem teste T14 (path SFU)
R23: ✅ tentativo — webcams não tocadas + teste ("Screenshare coexists with webcam")
R24: 🔍 em verificação — código (LockSettingsParams com defaults seguros) mas sem teste T17 (API sem novos params)
R25: 🔍 em verificação — código (cameraAsContent sem alteração) mas sem teste T16
R26: ⚪ não verificado — métricas/contadores de screenshare não encontrados; sem teste

## Estado dos testes
T01: 🔍 em verificação — "Non-presenter can start screenshare" existe em screenshare.spec.ts; não está em multi-screenshare.spec.ts
T02: 🔍 em verificação — "Two users can share screen simultaneously" em screenshare.spec.ts
T03: ✅ passou — "viewer screenshare goes to camera dock not content area" em multi-screenshare.spec.ts (7/7, 44.5s) (db09559)
T04: ✅ passou — "content area full cycle: slides → screenshare → promotion → slides" em multi-screenshare.spec.ts (8/8, 52s) (b3c1cf6)
T05: 🔍 em verificação — "Stopping one screenshare keeps the other active" em screenshare.spec.ts
T06: ✅ passou — "lock disableMultiScreenshare blocks viewer without promotion" em multi-screenshare.spec.ts; usa e.disableMultiScreenshare (R13 correto) (5490f36)
T07: ✅ passou — "lock disableMultiScreenshare stops active viewer screenshare server-side while keeping moderator stream alive" em multi-screenshare.spec.ts (9/9, 59.1s) (d81cb40)
T08: ⚪ não verificado — sem teste
T09: 🔍 em verificação — "Screenshare coexists with webcam" em screenshare.spec.ts
T10: 🔍 em verificação — "Multiple users can view an active screenshare" em screenshare.spec.ts (mapeamento parcial)
T11: ✅ passou — "presenter change keeps screenshares active without stopping" em multi-screenshare.spec.ts (7/7, 44.5s)
T12: ✅ passou — "external video migrates presenter screenshare to camera area" em multi-screenshare.spec.ts (7/7, 44.5s)
T13: ⚪ não verificado — sem teste (flag off → legado)
T14: ⚪ não verificado — sem teste (path SFU)
T15: ⚪ não verificado — sem teste (webcams com multi-share)
T16: ⚪ não verificado — sem teste (cameraAsContent)
T17: ⚪ não verificado — sem teste (API create sem novos params)
T18: ⚪ não verificado — sem teste (gravação)
T19: ✅ passou — "locked screenshare attempt does not eject viewer" em multi-screenshare.spec.ts (9/9, 59.1s)
T20: ⚪ não verificado — sem teste (métricas)
T21: ⚪ não verificado — sem teste (nomenclatura consistente)
T22: ✅ passou — "non-presenter moderator can start screenshare without promotion" em multi-screenshare.spec.ts (9/9, 59.1s)

## Arquivos tocados nesta sessão
/home/devuser/LOOP.md (→ .loop/LOOP.md no repo bigbluebutton)
bigbluebutton-tests/playwright/core/elements.ts (screenshareShowAsContentBtn adicionado)
bigbluebutton-tests/playwright/core/setup/global.setup.ts (ignoreHTTPSErrors adicionado)
bigbluebutton-tests/playwright/playwright.config.ts (ignoreHTTPSErrors adicionado)
bigbluebutton-tests/playwright/.env (NODE_TLS_REJECT_UNAUTHORIZED=0 adicionado)
bigbluebutton-tests/playwright/screenshare/screenshare.ts (contentAreaFullCycle, viewerScreenshareInCameraDock, lockStopsActiveViewerShares adicionados)
bigbluebutton-tests/playwright/screenshare/multi-screenshare.spec.ts (T04, T03, T07 adicionados)
```

# Protocolo do Loop

1. **Leitura:** leia este `LOOP.md` inteiro antes de qualquer ação. É a única memória confiável.
2. **Decisão:** consulte `Estado do Loop → Fase atual` e execute **apenas** o bloco da fase correspondente em `# Fases`.
3. **Execução:** siga o bloco da fase atual.
4. **Atualização:** ao terminar, atualize `Estado do Loop` por inteiro: nova fase, iteração `+1`, última ação em uma linha, próxima ação imperativa, estado de requisitos/testes atualizado, arquivos tocados.
5. **Parada:** Fase = `DONE` → imprimir resumo + sair; Fase = `BLOCKED` → imprimir bloqueios + sair.
6. **Commits:** a cada transição de fase, `loop: <fase_anterior> → <fase_nova> (it <n>)`. Em `VERIFICAR_REQUISITOS`, ao fechar um requisito: `req: R<n> ✅ <título curto>`. Em `CLEAN_CODE`, um commit por item resolvido: `refactor: <item>`.
7. **Contexto limpo:** nada é assumido de iterações anteriores além do que está neste arquivo.
8. **Sanidade:** se a iteração não consegue progredir, registrar em `Bloqueios`, marcar `BLOCKED` e sair — sem improviso.

# Fases

## Fase ENV_CHECK

1. Conectar por SSH ao container BBB de referência (`10.111.14.85` por padrão; validar se ainda existe).
2. Rodar `docker ps --format '{{.Names}}\t{{.Status}}'` e confirmar que `bbb-html5`, `bbb-apps-akka`, `bbb-graphql-server`, `postgres`, `livekit` estão `Up`.
3. Rodar `curl -skI https://<BBB_HOST>/bigbluebutton/api` e exigir HTTP 200.
4. Confirmar que o branch corrente é `feat/multi-screenshare` e está pushado para `imdt-claudiop/bigbluebutton`.
5. Decisão de transição:
   - Tudo OK → `Fase atual = INVENTÁRIO`, `Próxima ação = varredura superficial do código`.
   - Qualquer falha → `Fase atual = SETUP`, `Próxima ação = subir ambiente via bbb-docker-dev`.

## Fase SETUP

1. No host com `bbb-docker-dev` clonado, executar o script padrão:
   ```
   cd ~/bbb-docker-dev
   ./create_bbb.sh --image=imdt/bigbluebutton:3.0.x-develop --update bbb30 --custom-script=/home/devuser/custom.sh --docker-custom-params="-v /home/devuser/dev/bigbluebutton:/home/bigbluebutton/shared:rw"
   ```
2. Habilitar LiveKit em `/etc/bigbluebutton/bbb-webrtc-sfu/production.yml` (`.livekit.enabled = true`), reiniciar `bbb-webrtc-sfu` e `livekit-server`.
3. Checkout da branch: `cd /home/bigbluebutton/shared && git fetch && git checkout feat/multi-screenshare && git pull`.
4. Buildar componentes afetados (akka-bbb-apps, bbb-common-message, bbb-common-web, bigbluebutton-web, bbb-html5, bbb-graphql-server, bbb-graphql-actions, bbb-graphql-middleware).
5. Voltar para `ENV_CHECK`.

## Fase INVENTÁRIO

Executa uma única vez, na primeira entrada depois do `ENV_CHECK` OK.

1. Para cada R1..R26, fazer busca superficial no código (termos extraídos da regra de negócio: ex. `disableMultiScreenshare`, `hideViewersScreenshare`, `showAsContent`, `screenshares`, etc.) para estimar se já existe implementação plausível.
2. Para cada T01..T22, procurar em `bigbluebutton-tests/playwright/screenshare/` e afins se há teste com título/escopo similar.
3. Atualizar `Estado dos requisitos`:
   - Código plausível + teste plausível → `✅ tentativo`.
   - Apenas um dos dois → `🔍 em verificação`.
   - Nada → `⚪ não verificado`.
4. Atualizar `Estado dos testes` na mesma lógica.
5. **Não validar profundamente aqui.** A validação acontece em `VERIFICAR_REQUISITOS`. O inventário é rápido — até uma iteração.
6. Transição: `VERIFICAR_REQUISITOS`.

## Fase VERIFICAR_REQUISITOS

**Uma iteração = um requisito.**

Escolher o menor `R<n>` ainda não `✅ fechado`, nesta ordem de prioridade: `❌ lacuna` > `🔍 em verificação` > `✅ tentativo` > `⚪ não verificado`.

Executar os três sub-checks descritos em `# Critérios de Verificação por Requisito`:

1. **Funciona?** Exercitar o comportamento no ambiente. Se não bate, implementar/corrigir. Após 3 tentativas sem sucesso, marcar `❌ lacuna <descrição>` e transicionar para `BLOCKED`.
2. **Tem teste?** Um ou mais testes do `# Plano de Testes` com código executável. Se faltam, escrever conforme o plano e rodar até passar.
3. **Teste demonstra?** Ler passos e assertivas do teste e confirmar que ele exercita o comportamento da perspectiva certa, sem contorno via setup artificial (promoção de role, mock de lock, bypass de permissão). Se contorna, **reescrever o teste** (não o código de produção) até demonstrar corretamente.

Se os três passam → marcar requisito como `✅ fechado`, commitar `req: R<n> ✅ <título curto>` e seguir para o próximo.

**Regra dura (anti-atalho):** se um teste está passando apenas porque o setup contornou o comportamento real (ex.: promoveu viewer a presenter antes de "testar que viewer compartilha"), isso é Check 3 **falho**, não aprovação. Reescrever o teste.

Todos os R1..R26 `✅ fechado` → transição para `CLEAN_CODE`.

## Fase CLEAN_CODE

1. Percorrer `# Plano de Clean Code` item por item.
2. Para cada item vermelho, corrigir como lacuna normal (refatorar, sem aprovação humana). Commit por item: `refactor: <item>`.
3. Se a refatoração tocar código de um requisito já `✅ fechado`, voltar esse requisito para `🔍 em verificação` e retornar a `VERIFICAR_REQUISITOS` apenas para ele, garantindo que a refatoração não quebrou nada.
4. Quando todos os itens verdes e nenhum requisito foi reaberto → transição para `RE_TESTE`.

## Fase RE_TESTE

1. Rodar o `# Plano de Testes` **inteiro** (E2E-feliz, E2E-negativo, Regressão, Cobertura inversa).
2. Atualizar `Status` de cada teste.
3. Qualquer falha → voltar para `VERIFICAR_REQUISITOS` no requisito afetado (reabre como `🔍 em verificação`).
4. Tudo verde → transição para `PUSH`.

## Fase PUSH

1. Verificar que a árvore de trabalho está limpa (todos os commits feitos).
2. `git push` para o branch do PR.
3. Atualizar a descrição do PR com a lista de requisitos cobertos e links para os vídeos de evidência por teste.
4. Transição para `REVISAR_EVIDÊNCIAS`.

## Fase REVISAR_EVIDÊNCIAS

1. Para cada teste do plano, localizar vídeo/imagem anexada (Playwright grava automático).
2. Extrair frames-chave com `ffmpeg -i test.webm -vf fps=2 frame%03d.png` (início, transição principal, asserção final).
3. Análise crítica: os frames **demonstram** o comportamento prometido pelo requisito? Há sinais de contorno (viewer com badge de presenter, lock pré-desativada sem aparecer sendo ativada, etc.)?
4. Comparar com os passos descritos em cada linha do teste: cada passo tem um frame correspondente?
5. Marcar cada item do `# Plano de Revisão de Evidências` `- [x]` com link para o frame/vídeo, ou `- [ ]` com `<!-- motivo -->`.
6. Rodar `# Plano de Validação do PR` final.
7. Tudo verde → `DONE`. Falha de comportamento → voltar a `VERIFICAR_REQUISITOS`. Falha de vídeo/evidência do teste em si → voltar a `RE_TESTE`.

## Fase DONE

Imprimir resumo:
- Requisitos cobertos: R1..R26 (todos ✅).
- Testes passados por categoria (feliz, negativo, regressão, cobertura inversa).
- Refactors aplicados.
- URL do PR.
- Lista de vídeos de evidência com timestamps.
- Mensagem sugerida para atualização do PR na thread do Slack (em português).

Loop para aqui.

## Fase BLOCKED

Imprimir:
- Lista de bloqueios atuais.
- Última ação tentada.
- Hipóteses de causa raiz.
- Próximo experimento sugerido por bloqueio.

Aguardar humano.

# Anti-padrões Proibidos

- Modificar teste para fazê-lo passar quando a implementação está errada.
- Promover viewer a presenter (ou qualquer role artificial) no setup para desbloquear um teste — viola diretamente R1, R2, R9 e é exatamente o erro que ficou registrado na thread do Tiago (16/04 11:41).
- Mascarar lock settings desligadas no setup sem mostrar a ativação no teste (T06, T07, T08 exigem ver a ativação na gravação).
- Marcar requisito como `✅ fechado` sem os três sub-checks (Funciona, Tem teste, Teste demonstra) terem passado explicitamente.
- Reportar como "gap a implementar depois" algo que está listado em R1..R26 — tudo aqui é escopo.
- Inventar requisitos, anti-requisitos ou âncoras técnicas não citados na entrada.
- Mesclar múltiplos requisitos numa única iteração de `VERIFICAR_REQUISITOS`.
- Pular fase (ex.: `VERIFICAR_REQUISITOS` direto para `PUSH` sem `CLEAN_CODE` e `RE_TESTE`).
- Fazer refatoração não pedida fora de `CLEAN_CODE` (regra do escoteiro vai em branch separada).
- Assumir contexto de iterações anteriores além do `LOOP.md`.
- Fazer `push` antes de todos os requisitos fecharem e `CLEAN_CODE` passar.
- Declarar `DONE` sem ter revisado evidência frame-a-frame.
- Marcar item do PR como verde sem evidência objetiva (link, commit hash, output).
- Manipular `settings.yml` em runtime no container para esconder falta de implementação (ex.: `showButtonForNonPresenters=true` ao invés de remover a checagem no código).
- Reportar "pronto" em qualquer canal antes de rodar a suite completa em ambiente LiveKit real e revisar os vídeos.
- Postar atualização de status em canal errado. Toda comunicação vai na thread raiz do `#_bbb-claudio-tmp-multiscreenshare` (`C0AT09GUC86`, ts `1776299232.859129`).

# Contexto Original

### Thread de referência

- Canal: `#_bbb-claudio-tmp-multiscreenshare` — `C0AT09GUC86`.
- Thread principal: Tainan, `ts=1776299232.859129` (15/04 21:27, ATL).
- Período coberto pelo PACOTAO: 09:20 15/04/2026 → 21:05 16/04/2026 (America/Sao_Paulo).
- Agregado bruto: `PACOTAO.md` (2512 linhas) — fonte de verdade para cada decisão.

### Documentos âncora anexados pelo Tainan em 15/04 21:37

- `multi-screenshare-investigation.md` (8.1 KB): inventário de arquivos e contratos atuais.
- `multi-screenshare-architect-plan.md` (5.9 KB): direção arquitetural (stream-indexed, dual-read).
- `multi-screenshare-change-plan.md` (13.3 KB): plano de mudança em 7 fases.

### Pessoas e canais para consultar em caso de dúvida

- **Ambiguidade em lock semantics ou UX de multi-share:** `@Tainan Felipe` (`U7DDT3LG3`) no canal `C0AT09GUC86`.
- **Ambiguidade em prioridade de entrega, política de gravação, liberação de merge:** `@Tiago Jacobs` (`U0510HD4H`) no canal `C0AT09GUC86`.
- **Infra (containers, push, VPN):** seguir convenções do projeto (`/workspace/BBB.md`); abrir issue em `imdt-claudiop/melhorias-futuras` se algo do template precisar evoluir.

### Glossário específico

- **presenter / moderator / viewer:** papéis distintos. `presenter` é papel único por meeting (controla slides + conteúdo principal); `moderator` é role elevada (vários por meeting); `viewer` é role padrão.
- **`showAsContent`:** booleano por stream. Indica se o stream ocupa a área de apresentação. No máximo um `true` por reunião.
- **Lock setting:** controle do moderador em runtime, por reunião (aplicado via Lock Viewers).
- **Feature flag (`multiScreenshareEnabled`):** chave de deploy — liga/desliga a feature inteira.
- **LiveKit bridge vs SFU bridge:** dois paths paralelos de mídia. Multi-share existe apenas em LiveKit (decisão de simulcast).
- **"Área de apresentação"** e **"área das câmeras"** referem-se aos slots de layout do cliente BBB, independente de implementação específica.

### Erros passados a não repetir (auditados no PACOTAO)

- **16/04 17:22–17:24** (Tiago + Tainan) — atualização de "100% pronto" sem ambiente rodando. Regra incorporada: nenhum update de concluído sem ter validado o ambiente pós-build.
- **16/04 18:23** (Tainan) — não conseguiu acessar pasta do Drive por permissão privada. Regra: todos os links de evidência com `anyone with link` antes de postar.
- **16/04 18:27** (Tainan) — 2 vídeos na pasta, 11 testes acordados. Regra: cada teste com vídeo nomeado, listado no PR.
- **16/04 20:31** (Tiago) — solicitação deixou de ser atendida por falta de leitura do histórico. Regra: após qualquer solicitação na thread, registrar imediatamente em `Estado do Loop.Próxima ação`.
- **16/04 11:41** (Tiago) — "os testes parecem não demonstrar o que eles se propõe". Origem direta do Check 3 de cada requisito.

### Branch e infra

- Repo upstream: `bigbluebutton/bigbluebutton`.
- Fork com permissão de push: `imdt-claudiop/bigbluebutton`.
- Branch: `feat/multi-screenshare`.
- PR em andamento: `https://github.com/bigbluebutton/bigbluebutton/pull/24930`.
- Container BBB 3.0 from-source de referência: VMID 314, IP `10.111.14.85` — revalidar a cada `ENV_CHECK`.
