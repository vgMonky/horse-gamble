## Entidad: Caballo

El contrato **CaballoNFT** extiende el estándar ERC-721 para representar cada caballo como un token no fungible y, a su vez, incorporar toda la lógica necesaria para gestionar atributos (“stats”), tiempos de espera independientes y progresión de nivel dentro de nuestro sistema de carreras y mejoras.

### 1. Variables y estructura de datos

> **Contexto:** Cada caballo necesita almacenar por un lado sus atributos de desempeño, por otro lado dos esperas independientes (alimentación y descanso) y además llevar la cuenta de puntos que ha ganado y repartido. Para ello definimos:

1. **Stats de desempeño** (`uint256` cada uno):

   * `acceleration`  // puntos de aceleración
   * `stamina`       // puntos de resistencia
   * `minSpeed`      // puntos de velocidad mínima
   * `maxSpeed`      // puntos de velocidad máxima
   * `luck`          // puntos de suerte (bonus aleatorio)
   * `curveBonus`    // puntos extra en curvas
   * `straightBonus` // puntos extra en rectas

2. **Stats de espera** (`uint256` cada uno, inicial 0):

   * `raceCooldownStat` // al aumentar, *reduce* el tiempo de espera entre carreras
   * `feedCooldownStat` // al aumentar, *reduce* el tiempo de espera tras asignar puntos

3. **Timestamps de finalización de esperas** (`uint256` cada uno):

   * `restFinish` // instante (timestamp) a partir del cual el caballo puede inscribirse de nuevo
   * `feedFinish` // instante (timestamp) a partir del cual el caballo puede transferirse o inscribirse

4. **Puntos de progresión** (`uint256`):

   * `pointsUnassigned` // puntos obtenidos en carreras pero aún no repartidos
   * `pointsAssigned`   // puntos ya asignados a stats

---

### 2. Cálculo de avance en carrera

> **Contexto:** Para simular cada “paso” de la carrera, necesitamos calcular cuánto avanza un caballo según sus stats y una semilla aleatoria.

```solidity
function advanceHorse(
    uint256 id,           // id del caballo que avanza
    bytes32 rand,         // número aleatorio
    bool isRect,          // indica si estamos doblando una curva
    uint256 iteration     // número de iteración (entre 0 y 19 pasos o ticks que tiene la carrera)
) public view returns (uint256)
```

* **Qué hace:**

  1. Lee los stats de desempeño (`acceleration`, `stamina`, etc.) del caballo `id`.
  2. Combina esos valores con la semilla `rand` en un algoritmo (por ejemplo, mezclando y normalizando).
  3. Devuelve un `uint256` que representa la distancia o avance logrado en este “tick” de simulación.

* **Algoritmo:**


---

### 3. Gestión de puntos no asignados y cooldown tras carrera

> **Contexto:** Al terminar una carrera, el contrato de **Carrera** llamará a **CaballoNFT** para entregar los puntos ganados y bloquear temporalmente al caballo antes de su próxima inscripción.

```solidity
function setRacePrize(
    uint256 id,
    uint256 position,
    uint256 points
) external;
```

* **Flujo detallado:**

  1. **Verificación de llamada:** `require(msg.sender == address(Carrera));`
  2. **Acumulación de puntos:**

     ```solidity
     pointsUnassigned[id] += points;
     ```
  3. **Cálculo del tiempo de descanso real:**

     * Dado que `raceCooldownStat[id]` crece con puntos asignados, definimos una función inversa:

       ```
       restDelay = fInverse(raceCooldownStat[id])
       ```

       (a mayor stat, menor `restDelay`).
  4. **Actualización de `restFinish[id]`:**

     ```solidity
     if (restFinish[id] >= block.timestamp) {
         restFinish[id] += restDelay;
     } else {
         restFinish[id] = block.timestamp + restDelay;
     }
     ```

     De este modo, si el caballo ya estaba en espera, **acumula** tiempo adicional; si no, inicia un nuevo periodo desde “ahora”.

---

### 4. Asignación de puntos a stats y cooldown de alimentación

> **Contexto:** El jugador puede “alimentar” al caballo gastando HAY para distribuir sus `pointsUnassigned` en cualquiera de los stats, pero esto genera un bloqueo adicional de alimentación.

```solidity
function assignPoints(
    uint256  horseId,
    uint256  acceleration,
    uint256  stamina,
    uint256  minSpeed,
    uint256  maxSpeed,
    uint256  luck,
    uint256  curveBonus,
    uint256  straightBonus,
    uint256  raceCooldownStat,
    uint256  feedCooldownStat
) external;
```

* **Pasos:**

  1. **Aprobación de HAY:** El jugador hace `approve` por `totalPoints * pricePerPoint` al contrato CaballoNFT.
  2. **Transferencia de HAY:** `transferFrom(msg.sender, address(this), amount)`.
  3. **Distribución de puntos:**

     ```solidity
     pointsUnassigned[horseId] -= totalPoints;
     pointsAssigned[horseId]   += totalPoints;
     // Luego incrementa cada stat:
     stats.acceleration[horseId] += acceleration;
     … // y así sucesivamente
     ```
  4. **Cálculo del tiempo de alimentación real:**

     ```solidity
     feedDelay = fInverse(feedCooldownStat[horseId]);
     ```
  5. **Actualización de `feedFinish[horseId]`:**

     ```solidity
     if (feedFinish[horseId] >= block.timestamp) {
         feedFinish[horseId] += feedDelay;
     } else {
         feedFinish[horseId] = block.timestamp + feedDelay;
     }
     ```
  6. **Durante este periodo de alimentación**, el caballo:

     * **No** puede ser transferido.
     * **No** puede inscribirse (aunque podría terminar su descanso si ese cooldown ya venció).

---

### 5. Condiciones de libertad (inscripción vs. transferencia)

> **Contexto:** Debemos distinguir entre cuándo un caballo está listo para correr otra carrera y cuándo puede cambiar de dueño.

* **Libre para inscribirse en carrera** si y sólo si ambos cooldowns expiraron:

  ```solidity
  function canRegister(uint256 id) public view returns (bool) {
      return block.timestamp >= restFinish[id]
          && block.timestamp >= feedFinish[id];
  }
  ```

* **Libre para transferirse** si y sólo si terminó su alimentación:

  ```solidity
  function canTransfer(uint256 id) public view returns (bool) {
      return block.timestamp >= feedFinish[id];
  }
  ```

---

### 6. Cálculo de nivel

> **Contexto:** El nivel refleja la progresión total de un caballo (puntos asignados + no asignados) y se computa como log₂ truncado. Se puede hacer de forma global (sobre los puntos totales) o para una propiedad concreta.

```solidity
function level(uint256 horseId) public view returns (uint256) {
    uint256 total = pointsAssigned[horseId] + pointsUnassigned[horseId];
    return floorLog2(total);
}

function levelProp(uint256 points) public view returns (uint256) {
    return floorLog2(points);
}
```

-------------------------
**VER ABAJJO LogCurve**
-------------------------



* **Ejemplo de `floorLog2`**:

  ```solidity
  function floorLog2(uint256 x) internal pure returns (uint256) {
      uint256 res;
      while (x > 1) {
          x >>= 1;
          res++;
      }
      return res;
  }
  ```

---

### 7. Seguridad y validaciones

> **Contexto:** Para garantizar integridad y evitar estados inconsistentes:

* **Modificadores**

  * `onlyRaceContract` en `setRacePrize`
  * `onlyWhenNotCoolingForRegistration` en inscripción de carrera que use `canRegister`
  * `onlyWhenNotCoolingForTransfer` en `transferFrom` personalizado que use `canTransfer`

* **Patrón Checks-Effects-Interactions**

  * Actualizar estado antes de realizar transferencias de HAY o ERC-721.

* **ReentrancyGuard**

  * En `assignPoints` y en funciones de pago/eventos críticos.



-------------
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { UD60x18, ud } from "@prb/math/src/UD60x18.sol";

contract LogCurve {
    /// @notice Calcula log₂(points) * baseValue, ambos en punto fijo 60.18.
    /// @param points     Número entero > 0 (p. ej. 100).
    /// @param baseValue  Escala en 60.18 (1.0 → 1e18, 0.5 → 0.5e18).
    /// @return result    Resultado en 60.18, sin truncar.
    function logCurve(uint256 points, uint256 baseValue)
        external
        pure
        returns (uint256 result)
    {
        require(points > 0, "Points must be > 0");
        // Convertimos `points` y `baseValue` a UD60x18
        UD60x18 x = ud(points * 1e18);
        UD60x18 scale = ud(baseValue);
        // Calculamos log2(x) y multiplicamos por el factor
        UD60x18 res = x.log2().mul(scale);
        // Desempaquetamos el valor 60.18 a uint256
        result = res.intoUint256();
    }
}
```

